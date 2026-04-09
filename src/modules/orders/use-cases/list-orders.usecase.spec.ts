import { Test, TestingModule } from '@nestjs/testing';
import { ListOrdersUseCase } from './list-orders.usecase';
import { OrdersRepository } from '@orders/repository/orders.repository';
import { OrderMapper } from '@orders/mappers/order.mapper';
import { PaginationDto } from '@common/dtos/pagination.dto';

describe('ListOrdersUseCase', () => {
 let useCase: ListOrdersUseCase;
 let ordersRepository: OrdersRepository;

 const mockOrdersRepository = {
  findAll: jest.fn(),
  count: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    ListOrdersUseCase,
    {
     provide: OrdersRepository,
     useValue: mockOrdersRepository,
    },
   ],
  }).compile();

  useCase = module.get<ListOrdersUseCase>(ListOrdersUseCase);
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
  const mockOrders = [
   { id: 'order-1', totalPrice: 100 },
   { id: 'order-2', totalPrice: 200 },
  ];

  const mockMappedOrders = [
   { id: 'order-1', totalPrice: 100 },
   { id: 'order-2', totalPrice: 200 },
  ];

  it('deve retornar pedidos paginados com metadados corretos', async () => {

   const paginationDto: PaginationDto = { page: 2, limit: 10 };
   const totalInDb = 25;

   mockOrdersRepository.findAll.mockResolvedValueOnce(mockOrders);
   mockOrdersRepository.count.mockResolvedValueOnce(totalInDb);

   const mapperSpy = jest.spyOn(OrderMapper, 'toResponseList').mockReturnValueOnce(mockMappedOrders as any);


   const result = await useCase.execute(paginationDto);



   expect(mockOrdersRepository.findAll).toHaveBeenCalledWith(10, 10);
   expect(mockOrdersRepository.count).toHaveBeenCalled();
   expect(mapperSpy).toHaveBeenCalledWith(mockOrders);

   expect(result.data).toEqual(mockMappedOrders);
   expect(result.meta).toEqual({
    totalItems: 25,
    itemCount: 2,
    itemsPerPage: 10,
    totalPages: 3,
    currentPage: 2,
   });
  });

  it('deve usar valores padrão (page 1, limit 20) se o DTO for vazio', async () => {

   const paginationDto: PaginationDto = {};
   mockOrdersRepository.findAll.mockResolvedValueOnce([]);
   mockOrdersRepository.count.mockResolvedValueOnce(0);


   await useCase.execute(paginationDto);


   expect(mockOrdersRepository.findAll).toHaveBeenCalledWith(0, 20);
  });

  it('deve lidar com lista vazia corretamente', async () => {

   mockOrdersRepository.findAll.mockResolvedValueOnce([]);
   mockOrdersRepository.count.mockResolvedValueOnce(0);


   const result = await useCase.execute({ page: 1, limit: 10 });


   expect(result.data).toEqual([]);
   expect(result.meta.totalPages).toBe(0);
   expect(result.meta.totalItems).toBe(0);
  });

  it('deve propagar erros caso a busca no repositório falhe', async () => {

   const dbError = new Error('Database connection failed');
   mockOrdersRepository.findAll.mockRejectedValueOnce(dbError);


   await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow(dbError);
  });
 });
});