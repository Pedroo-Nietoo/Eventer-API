import { Test, TestingModule } from '@nestjs/testing';
import { FindOrderUseCase } from './find-order.usecase';
import { OrdersRepository } from '@orders/repository/orders.repository';
import { OrderMapper } from '@orders/mappers/order.mapper';
import { UserRole } from '@common/enums/role.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('FindOrderUseCase', () => {
 let useCase: FindOrderUseCase;
 let ordersRepository: OrdersRepository;

 const mockOrdersRepository = {
  findById: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    FindOrderUseCase,
    {
     provide: OrdersRepository,
     useValue: mockOrdersRepository,
    },
   ],
  }).compile();

  useCase = module.get<FindOrderUseCase>(FindOrderUseCase);
  ordersRepository = module.get<OrdersRepository>(OrdersRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const orderId = 'order-123';
  const ownerId = 'user-owner';
  const strangerId = 'user-stranger';

  const mockOrderEntity = {
   id: orderId,
   userId: ownerId,
   totalPrice: 100,
   status: 'PAID',
  };

  const mockOrderResponse = {
   id: orderId,
   totalPrice: 100,
  };

  it('deve retornar o pedido se o usuário for o dono', async () => {

   mockOrdersRepository.findById.mockResolvedValueOnce(mockOrderEntity);
   const mapperSpy = jest.spyOn(OrderMapper, 'toResponse').mockReturnValueOnce(mockOrderResponse as any);


   const result = await useCase.execute(orderId, ownerId, UserRole.USER);


   expect(result).toEqual(mockOrderResponse);
   expect(mapperSpy).toHaveBeenCalledWith(mockOrderEntity);
  });

  it('deve retornar o pedido se o usuário for um ADMIN, mesmo não sendo o dono', async () => {

   mockOrdersRepository.findById.mockResolvedValueOnce(mockOrderEntity);
   const mapperSpy = jest.spyOn(OrderMapper, 'toResponse').mockReturnValueOnce(mockOrderResponse as any);


   const result = await useCase.execute(orderId, strangerId, UserRole.ADMIN);


   expect(result).toEqual(mockOrderResponse);
   expect(mockOrdersRepository.findById).toHaveBeenCalledWith(orderId);
  });

  it('deve lançar NotFoundException se o pedido não existir', async () => {

   mockOrdersRepository.findById.mockResolvedValueOnce(null);


   await expect(useCase.execute(orderId, ownerId, UserRole.USER)).rejects.toThrow(
    new NotFoundException('Pedido não encontrado.')
   );
  });

  it('deve lançar ForbiddenException se um usuário comum tentar acessar pedido de outro', async () => {

   mockOrdersRepository.findById.mockResolvedValueOnce(mockOrderEntity);


   await expect(useCase.execute(orderId, strangerId, UserRole.USER)).rejects.toThrow(
    new ForbiddenException('Acesso negado a este pedido.')
   );


   expect(jest.spyOn(OrderMapper, 'toResponse')).not.toHaveBeenCalled();
  });

  it('deve propagar erros do repositório', async () => {

   mockOrdersRepository.findById.mockRejectedValueOnce(new Error('DB Error'));


   await expect(useCase.execute(orderId, ownerId, UserRole.USER)).rejects.toThrow('DB Error');
  });
 });
});