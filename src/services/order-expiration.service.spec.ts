import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { DataSource, LessThan } from 'typeorm';
import { OrderExpirationService } from './order-expiration.service';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Order } from '@orders/entities/order.entity';

describe('OrderExpirationService', () => {
 let service: OrderExpirationService;
 let dataSource: DataSource;
 let ticketTypesRepository: TicketTypesRepository;


 const mockEntityManager = {
  update: jest.fn(),
 };


 const mockOrderRepository = {
  find: jest.fn(),
 };


 const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockOrderRepository),
  transaction: jest.fn().mockImplementation(async (cb) => {

   return cb(mockEntityManager);
  }),
 };


 const mockTicketTypesRepository = {
  incrementStock: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    OrderExpirationService,
    {
     provide: DataSource,
     useValue: mockDataSource,
    },
    {
     provide: TicketTypesRepository,
     useValue: mockTicketTypesRepository,
    },
   ],
  }).compile();

  service = module.get<OrderExpirationService>(OrderExpirationService);
  dataSource = module.get<DataSource>(DataSource);
  ticketTypesRepository = module.get<TicketTypesRepository>(
   TicketTypesRepository,
  );


  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(service).toBeDefined();
 });

 describe('execute', () => {
  beforeAll(() => {

   jest.useFakeTimers();
   jest.setSystemTime(new Date('2026-04-08T12:00:00Z'));
  });

  afterAll(() => {

   jest.useRealTimers();
  });

  it('deve buscar pedidos pendentes criados há mais de 1 minuto', async () => {
   mockOrderRepository.find.mockResolvedValueOnce([]);

   await service.execute();

   const expectedLimit = new Date('2026-04-08T11:59:00Z');

   expect(mockOrderRepository.find).toHaveBeenCalledWith({
    where: {
     status: OrderStatus.PENDING,
     createdAt: LessThan(expectedLimit)
    },
    take: 50,
   });
  });

  it('não deve iniciar nenhuma transação se não houver pedidos expirados', async () => {
   mockOrderRepository.find.mockResolvedValueOnce([]);

   await service.execute();

   expect(mockDataSource.transaction).not.toHaveBeenCalled();
  });

  it('deve cancelar o pedido e devolver o estoque com sucesso', async () => {
   const mockOrder = { id: 1, ticketTypeId: 10, quantity: 2 };
   mockOrderRepository.find.mockResolvedValueOnce([mockOrder]);
   mockEntityManager.update.mockResolvedValueOnce({ affected: 1 });

   await service.execute();

   expect(mockDataSource.transaction).toHaveBeenCalled();


   expect(mockEntityManager.update).toHaveBeenCalledWith(
    Order,
    { id: mockOrder.id, status: OrderStatus.PENDING },
    { status: OrderStatus.CANCELLED },
   );


   expect(ticketTypesRepository.incrementStock).toHaveBeenCalledWith(
    mockOrder.ticketTypeId,
    mockOrder.quantity,
    mockEntityManager,
   );
  });

  it('não deve devolver o estoque se a atualização do pedido retornar affected: 0', async () => {
   const mockOrder = { id: 2, ticketTypeId: 20, quantity: 1 };
   mockOrderRepository.find.mockResolvedValueOnce([mockOrder]);


   mockEntityManager.update.mockResolvedValueOnce({ affected: 0 });

   await service.execute();

   expect(mockDataSource.transaction).toHaveBeenCalled();
   expect(mockEntityManager.update).toHaveBeenCalled();


   expect(ticketTypesRepository.incrementStock).not.toHaveBeenCalled();
  });

  it('deve processar múltiplos pedidos abrindo transações individuais', async () => {
   const mockOrders = [
    { id: 1, ticketTypeId: 10, quantity: 2 },
    { id: 2, ticketTypeId: 20, quantity: 1 },
   ];
   mockOrderRepository.find.mockResolvedValueOnce(mockOrders);


   mockEntityManager.update.mockResolvedValue({ affected: 1 });

   await service.execute();

   expect(mockDataSource.transaction).toHaveBeenCalledTimes(2);
   expect(mockEntityManager.update).toHaveBeenCalledTimes(2);
   expect(ticketTypesRepository.incrementStock).toHaveBeenCalledTimes(2);
  });
 });

 it('deve lançar erro se a busca de pedidos expirados falhar', async () => {
  const dbError = new Error('Database connection lost on find');
  mockOrderRepository.find.mockRejectedValueOnce(dbError);

  await expect(service.execute()).rejects.toThrow(dbError);


  expect(mockDataSource.transaction).not.toHaveBeenCalled();
 });

 it('deve lançar erro e não devolver o estoque se o update do pedido falhar', async () => {
  const mockOrder = { id: 1, ticketTypeId: 10, quantity: 2 };
  mockOrderRepository.find.mockResolvedValueOnce([mockOrder]);

  const dbError = new Error('Database error on update');
  mockEntityManager.update.mockRejectedValueOnce(dbError);

  await expect(service.execute()).rejects.toThrow(dbError);

  expect(mockDataSource.transaction).toHaveBeenCalled();
  expect(mockEntityManager.update).toHaveBeenCalled();

  expect(ticketTypesRepository.incrementStock).not.toHaveBeenCalled();
 });

 it('deve lançar erro se o incremento de estoque falhar', async () => {
  const mockOrder = { id: 1, ticketTypeId: 10, quantity: 2 };
  mockOrderRepository.find.mockResolvedValueOnce([mockOrder]);


  mockEntityManager.update.mockResolvedValueOnce({ affected: 1 });
  const dbError = new Error('Database error on incrementStock');
  mockTicketTypesRepository.incrementStock.mockRejectedValueOnce(dbError);

  await expect(service.execute()).rejects.toThrow(dbError);

  expect(mockDataSource.transaction).toHaveBeenCalled();
  expect(mockEntityManager.update).toHaveBeenCalled();
  expect(ticketTypesRepository.incrementStock).toHaveBeenCalled();
 });

 it('deve interromper o processamento dos próximos pedidos se um falhar', async () => {
  const mockOrders = [
   { id: 1, ticketTypeId: 10, quantity: 2 },
   { id: 2, ticketTypeId: 20, quantity: 1 },
  ];
  mockOrderRepository.find.mockResolvedValueOnce(mockOrders);

  const dbError = new Error('Error processing first order');


  mockDataSource.transaction.mockRejectedValueOnce(dbError);

  await expect(service.execute()).rejects.toThrow(dbError);


  expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
 });
});