import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { OrdersRepository } from './orders.repository';
import { Order } from '@orders/entities/order.entity';
import { OrderStatus } from '@common/enums/order-status.enum';

describe('OrdersRepository', () => {
 let repository: OrdersRepository;
 let typeormRepo: Repository<Order>;


 const mockTypeORMRepo = {
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
 };


 const mockEntityManager = {

  getRepository: jest.fn().mockReturnValue(mockTypeORMRepo),
 } as unknown as EntityManager;

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    OrdersRepository,
    {
     provide: getRepositoryToken(Order),
     useValue: mockTypeORMRepo,
    },
   ],
  }).compile();

  repository = module.get<OrdersRepository>(OrdersRepository);
  typeormRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(repository).toBeDefined();
 });

 describe('createOrder', () => {
  const orderData = { totalAmount: 100 } as Partial<Order>;
  const createdOrder = { id: 'order-1', totalAmount: 100 } as unknown as Order;

  it('deve criar e salvar um pedido usando o repositório padrão', async () => {
   mockTypeORMRepo.create.mockReturnValue(createdOrder);
   mockTypeORMRepo.save.mockResolvedValue(createdOrder);

   const result = await repository.createOrder(orderData);

   expect(typeormRepo.create).toHaveBeenCalledWith(orderData);
   expect(typeormRepo.save).toHaveBeenCalledWith(createdOrder);
   expect(result).toEqual(createdOrder);
  });

  it('deve criar e salvar um pedido usando o EntityManager (Transação)', async () => {
   mockTypeORMRepo.create.mockReturnValue(createdOrder);
   mockTypeORMRepo.save.mockResolvedValue(createdOrder);

   const result = await repository.createOrder(orderData, mockEntityManager);


   expect(mockEntityManager.getRepository).toHaveBeenCalledWith(Order);
   expect(mockTypeORMRepo.create).toHaveBeenCalledWith(orderData);
   expect(mockTypeORMRepo.save).toHaveBeenCalledWith(createdOrder);
   expect(result).toEqual(createdOrder);
  });
 });

 describe('updateSessionId', () => {
  const orderId = 'order-123';
  const sessionId = 'cs_test_abc123';

  it('deve atualizar o sessionId usando o repositório padrão', async () => {
   await repository.updateSessionId(orderId, sessionId);

   expect(typeormRepo.update).toHaveBeenCalledWith(orderId, { stripeSessionId: sessionId });
  });

  it('deve atualizar o sessionId usando o EntityManager (Transação)', async () => {
   await repository.updateSessionId(orderId, sessionId, mockEntityManager);

   expect(mockEntityManager.getRepository).toHaveBeenCalledWith(Order);
   expect(mockTypeORMRepo.update).toHaveBeenCalledWith(orderId, { stripeSessionId: sessionId });
  });
 });

 describe('findBySessionId', () => {
  it('deve buscar um pedido pelo sessionId incluindo as relações', async () => {
   const sessionId = 'cs_test_xyz789';
   const mockOrder = { id: 'order-1', stripeSessionId: sessionId } as Order;

   mockTypeORMRepo.findOne.mockResolvedValue(mockOrder);

   const result = await repository.findBySessionId(sessionId);

   expect(typeormRepo.findOne).toHaveBeenCalledWith({
    where: { stripeSessionId: sessionId },
    relations: ['user', 'ticketType', 'ticketType.event'],
   });
   expect(result).toEqual(mockOrder);
  });
 });

 describe('updateStatus', () => {
  const orderId = 'order-456';
  const status = OrderStatus.PAID;

  it('deve atualizar o status usando o repositório padrão', async () => {
   await repository.updateStatus(orderId, status);

   expect(typeormRepo.update).toHaveBeenCalledWith(orderId, { status });
  });

  it('deve atualizar o status usando o EntityManager (Transação)', async () => {
   await repository.updateStatus(orderId, status, mockEntityManager);

   expect(mockEntityManager.getRepository).toHaveBeenCalledWith(Order);
   expect(mockTypeORMRepo.update).toHaveBeenCalledWith(orderId, { status });
  });
 });
});