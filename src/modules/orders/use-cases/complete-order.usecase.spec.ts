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
 let loggerErrorSpy: jest.SpyInstance;

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
  loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
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
  });

  it('deve lançar erro e logar se falhar ao atualizar status para PAID', async () => {
   mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
   const dbError = new Error('Falha no banco');
   mockOrdersRepository.updateStatus.mockRejectedValueOnce(dbError);

   await expect(useCase.execute(orderId)).rejects.toThrow(dbError);

   expect(loggerErrorSpy).toHaveBeenCalledWith(
    expect.stringContaining(`Falha crítica ao atualizar status do pedido ${orderId} para PAID:`),
    dbError
   );
   expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
  });

  it('deve garantir que o release do queryRunner ocorra mesmo em falhas de emissão', async () => {
   mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
   mockQueryRunner.manager.findOne.mockResolvedValueOnce({ event: { id: 'evt-1' } });

   mockCreateTicketUseCase.execute.mockRejectedValue(new Error('Falha catastrófica'));

   await useCase.execute(orderId);

   expect(mockQueryRunner.release).toHaveBeenCalled();
   expect(loggerErrorSpy).toHaveBeenCalled();
  });

  it('deve capturar erros na fase de preparação (QueryRunner) e relançar', async () => {
   mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
   const connError = new Error('Connection lost');
   mockQueryRunner.connect.mockRejectedValueOnce(connError);

   await expect(useCase.execute(orderId)).rejects.toThrow(connError);

   expect(loggerErrorSpy).toHaveBeenCalledWith(
    expect.stringContaining(`Erro durante a fase de emissão de bilhetes do pedido ${orderId}:`),
    connError
   );
   expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('deve ignorar o pedido se ele não existir ou não estiver PENDING', async () => {
   mockOrdersRepository.findById.mockResolvedValueOnce(null);
   const warnSpy = jest.spyOn(Logger.prototype, 'warn');

   await useCase.execute(orderId);

   expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('ignorado'));
   expect(mockOrdersRepository.updateStatus).not.toHaveBeenCalled();
  });
 });
});