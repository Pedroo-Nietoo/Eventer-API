import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { DataSource, LessThan } from 'typeorm';
import { OrderExpirationService } from './order-expiration.service';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { OrderStatus } from '@common/enums/order-status.enum';

describe('OrderExpirationService', () => {
 let service: OrderExpirationService;
 let dataSource: DataSource;
 let ticketTypesRepository: TicketTypesRepository;
 let loggerErrorSpy: jest.SpyInstance;
 let loggerLogSpy: jest.SpyInstance;

 const mockEntityManager = {
  update: jest.fn(),
 };

 const mockOrderRepository = {
  find: jest.fn(),
 };

 const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockOrderRepository),
  transaction: jest.fn().mockImplementation(async (cb) => cb(mockEntityManager)),
 };

 const mockTicketTypesRepository = {
  incrementStock: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    OrderExpirationService,
    { provide: DataSource, useValue: mockDataSource },
    { provide: TicketTypesRepository, useValue: mockTicketTypesRepository },
   ],
  }).compile();

  service = module.get<OrderExpirationService>(OrderExpirationService);
  dataSource = module.get<DataSource>(DataSource);
  ticketTypesRepository = module.get<TicketTypesRepository>(TicketTypesRepository);

  loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
  loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 describe('Instanciação', () => {
  it('deve estar definido via injeção do Nest', () => {
   expect(service).toBeDefined();
  });

  it('deve instanciar o serviço diretamente (cobertura de construtor)', () => {
   const manualService = new OrderExpirationService(dataSource, ticketTypesRepository);
   expect(manualService).toBeDefined();
  });
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
    where: { status: OrderStatus.PENDING, createdAt: LessThan(expectedLimit) },
    take: 50,
   });
  });

  it('deve atualizar o pedido para EXPIRED e devolver o estoque com sucesso', async () => {
   const mockOrders = [{ id: 'order-1', ticketTypeId: 'type-1', quantity: 2 }];
   mockOrderRepository.find.mockResolvedValueOnce(mockOrders);
   mockEntityManager.update.mockResolvedValueOnce({ affected: 1 });

   await service.execute();

   expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
   expect(mockEntityManager.update).toHaveBeenCalledWith(
    expect.any(Function),
    { id: 'order-1', status: OrderStatus.PENDING },
    { status: OrderStatus.EXPIRED }
   );
   expect(ticketTypesRepository.incrementStock).toHaveBeenCalledWith('type-1', 2, mockEntityManager);
   expect(loggerLogSpy).toHaveBeenCalledWith('Pedido order-1 expirado. Estoque devolvido.');
  });

  it('não deve devolver o estoque se o update não afetar nenhuma linha (concorrência)', async () => {
   const mockOrders = [{ id: 'order-concorrencia', ticketTypeId: 'type-1', quantity: 2 }];
   mockOrderRepository.find.mockResolvedValueOnce(mockOrders);
   mockEntityManager.update.mockResolvedValueOnce({ affected: 0 });

   await service.execute();

   expect(ticketTypesRepository.incrementStock).not.toHaveBeenCalled();
  });

  it('não deve devolver o estoque se affected for undefined', async () => {
   const mockOrders = [{ id: 'order-undefined', ticketTypeId: 'type-1', quantity: 2 }];
   mockOrderRepository.find.mockResolvedValueOnce(mockOrders);
   mockEntityManager.update.mockResolvedValueOnce({ affected: undefined });

   await service.execute();

   expect(ticketTypesRepository.incrementStock).not.toHaveBeenCalled();
  });

  it('não deve devolver o estoque se affected for negativo', async () => {
   const mockOrders = [{ id: 'order-negativo', ticketTypeId: 'type-1', quantity: 2 }];
   mockOrderRepository.find.mockResolvedValueOnce(mockOrders);
   mockEntityManager.update.mockResolvedValueOnce({ affected: -1 });

   await service.execute();

   expect(ticketTypesRepository.incrementStock).not.toHaveBeenCalled();
  });

  it('não deve devolver o estoque se result for objeto vazio sem affected', async () => {
   const mockOrders = [{ id: 'order-empty', ticketTypeId: 'type-1', quantity: 2 }];
   mockOrderRepository.find.mockResolvedValueOnce(mockOrders);
   mockEntityManager.update.mockResolvedValueOnce({});

   await service.execute();

   expect(ticketTypesRepository.incrementStock).not.toHaveBeenCalled();
  });

  it('deve cair no catch se o result for null forçando TypeError na leitura do affected', async () => {
   const mockOrders = [{ id: 'order-null', ticketTypeId: 'type-1', quantity: 2 }];
   mockOrderRepository.find.mockResolvedValueOnce(mockOrders);
   mockEntityManager.update.mockResolvedValueOnce(null);

   await service.execute();

   expect(loggerErrorSpy).toHaveBeenCalledWith(
    expect.stringContaining('Falha ao processar expiração do pedido order-null:'),
    expect.any(Error)
   );
   expect(ticketTypesRepository.incrementStock).not.toHaveBeenCalled();
  });

  it('deve continuar o processamento mesmo se um pedido falhar (Resiliência)', async () => {
   const mockOrders = [
    { id: 'order-fail', ticketTypeId: 'type-1', quantity: 1 },
    { id: 'order-success', ticketTypeId: 'type-2', quantity: 2 },
   ];
   mockOrderRepository.find.mockResolvedValueOnce(mockOrders);

   const dbError = new Error('Erro na transação');
   mockDataSource.transaction
    .mockRejectedValueOnce(dbError)
    .mockImplementationOnce(async (cb) => cb(mockEntityManager));

   mockEntityManager.update.mockResolvedValueOnce({ affected: 1 });

   await service.execute();

   expect(loggerErrorSpy).toHaveBeenCalledWith(
    expect.stringContaining('Falha ao processar expiração do pedido order-fail:'),
    dbError
   );

   expect(mockDataSource.transaction).toHaveBeenCalledTimes(2);
   expect(ticketTypesRepository.incrementStock).toHaveBeenCalledTimes(1);
  });

  it('deve lançar erro apenas se a busca inicial por pedidos falhar', async () => {
   const dbError = new Error('Falha de conexão');
   mockOrderRepository.find.mockRejectedValueOnce(dbError);

   await expect(service.execute()).rejects.toThrow(dbError);
  });
 });
});