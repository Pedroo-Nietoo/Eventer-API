import { Test, TestingModule } from '@nestjs/testing';
import { CompleteOrderUseCase } from './complete-order.usecase';
import { OrdersRepository } from '@orders/repository/orders.repository';
import { CreateTicketUseCase } from '@tickets/use-cases/create-ticket.usecase';
import { DataSource } from 'typeorm';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Logger, NotFoundException } from '@nestjs/common';

describe('CompleteOrderUseCase', () => {
 let useCase: CompleteOrderUseCase;
 let ordersRepository: OrdersRepository;
 let createTicketUseCase: CreateTicketUseCase;
 let dataSource: DataSource;


 const mockQueryRunner = {
  connect: jest.fn(),
  release: jest.fn(),
  manager: {
   findOne: jest.fn(),
  },
 };

 const mockOrdersRepository = {
  findById: jest.fn(),
  updateStatus: jest.fn(),
 };

 const mockCreateTicketUseCase = {
  execute: jest.fn(),
 };

 const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    CompleteOrderUseCase,
    { provide: OrdersRepository, useValue: mockOrdersRepository },
    { provide: DataSource, useValue: mockDataSource },
    { provide: CreateTicketUseCase, useValue: mockCreateTicketUseCase },
   ],
  }).compile();

  useCase = module.get<CompleteOrderUseCase>(CompleteOrderUseCase);
  ordersRepository = module.get<OrdersRepository>(OrdersRepository);
  createTicketUseCase = module.get<CreateTicketUseCase>(CreateTicketUseCase);
  dataSource = module.get<DataSource>(DataSource);

  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 describe('execute', () => {
  const orderId = 'order-1';
  const mockOrder = {
   id: orderId,
   status: OrderStatus.PENDING,
   ticketTypeId: 'type-1',
   userId: 'user-1',
   quantity: 2,
  };

  it('deve completar o pedido e emitir os ingressos com sucesso', async () => {

   mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
   mockQueryRunner.manager.findOne.mockResolvedValueOnce({
    event: { id: 'event-1' }
   });


   await useCase.execute(orderId);


   expect(mockOrdersRepository.updateStatus).toHaveBeenCalledWith(orderId, OrderStatus.PAID);
   expect(mockQueryRunner.connect).toHaveBeenCalled();
   expect(mockQueryRunner.release).toHaveBeenCalled();


   expect(mockCreateTicketUseCase.execute).toHaveBeenCalledTimes(2);
   expect(mockCreateTicketUseCase.execute).toHaveBeenCalledWith(
    { ticketTypeId: 'type-1', eventId: 'event-1' },
    'user-1'
   );
  });

  it('deve ignorar e logar aviso se o pedido não estiver PENDING', async () => {

   mockOrdersRepository.findById.mockResolvedValueOnce({
    ...mockOrder, status: OrderStatus.CANCELLED
   });
   const warnSpy = jest.spyOn(Logger.prototype, 'warn');


   await useCase.execute(orderId);


   expect(mockOrdersRepository.updateStatus).not.toHaveBeenCalled();
   expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('ignorado'));
   expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se o TicketType não for encontrado', async () => {

   mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
   mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);


   await expect(useCase.execute(orderId)).rejects.toThrow(NotFoundException);
   expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('deve continuar o loop e logar erro se a emissão de um ingresso falhar', async () => {

   mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
   mockQueryRunner.manager.findOne.mockResolvedValueOnce({ event: { id: 'evt-1' } });


   mockCreateTicketUseCase.execute
    .mockRejectedValueOnce(new Error('Falha na emissão'))
    .mockResolvedValueOnce({});

   const errorSpy = jest.spyOn(Logger.prototype, 'error');


   await useCase.execute(orderId);


   expect(mockCreateTicketUseCase.execute).toHaveBeenCalledTimes(2);
   expect(errorSpy).toHaveBeenCalledTimes(1);
   expect(errorSpy).toHaveBeenCalledWith(
    expect.stringContaining('Erro ao emitir o ingresso 1 de 2'),
    expect.any(Error)
   );
  });

  it('deve propagar erro se a atualização de status do pedido falhar', async () => {
   mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
   const dbError = new Error('DB Error');
   mockOrdersRepository.updateStatus.mockRejectedValueOnce(dbError);

   await expect(useCase.execute(orderId)).rejects.toThrow(dbError);
   expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
  });
 });
});