import { Test, TestingModule } from '@nestjs/testing';
import { DeleteOrderUseCase } from './delete-order.usecase';
import { OrdersRepository } from '@orders/repository/orders.repository';
import { NotFoundException } from '@nestjs/common';

describe('DeleteOrderUseCase', () => {
 let useCase: DeleteOrderUseCase;
 let ordersRepository: OrdersRepository;


 const mockOrdersRepository = {
  softDelete: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    DeleteOrderUseCase,
    {
     provide: OrdersRepository,
     useValue: mockOrdersRepository,
    },
   ],
  }).compile();

  useCase = module.get<DeleteOrderUseCase>(DeleteOrderUseCase);
  ordersRepository = module.get<OrdersRepository>(OrdersRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockOrderId = 'order-uuid-123';

  it('deve executar o softDelete com sucesso', async () => {


   mockOrdersRepository.softDelete.mockResolvedValueOnce({ affected: 1 });



   await expect(useCase.execute(mockOrderId)).resolves.not.toThrow();

   expect(mockOrdersRepository.softDelete).toHaveBeenCalledWith(mockOrderId);
   expect(mockOrdersRepository.softDelete).toHaveBeenCalledTimes(1);
  });

  it('deve lançar NotFoundException se nenhum registro for afetado', async () => {


   mockOrdersRepository.softDelete.mockResolvedValueOnce({ affected: 0 });


   await expect(useCase.execute(mockOrderId)).rejects.toThrow(
    new NotFoundException(`Pedido com o ID ${mockOrderId} não encontrado.`)
   );

   expect(mockOrdersRepository.softDelete).toHaveBeenCalledWith(mockOrderId);
  });

  it('deve propagar erro se o repositório falhar catastroficamente', async () => {

   const dbError = new Error('Database connection lost');
   mockOrdersRepository.softDelete.mockRejectedValueOnce(dbError);


   await expect(useCase.execute(mockOrderId)).rejects.toThrow(dbError);
  });
 });
});