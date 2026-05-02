import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from './create-order.usecase';
import { OrdersRepository } from '@orders/repository/orders.repository';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { StripeService } from '@infra/stripe/stripe.service';
import { DataSource, EntityManager } from 'typeorm';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('CreateOrderUseCase', () => {
 let useCase: CreateOrderUseCase;
 let ordersRepository: OrdersRepository;
 let ticketTypesRepository: TicketTypesRepository;
 let stripeService: StripeService;
 let dataSource: DataSource;

 const mockManager = {} as EntityManager;

 const mockOrdersRepository = {
  createOrder: jest.fn(),
  updateSessionId: jest.fn(),
  updateStatus: jest.fn(),
 };

 const mockTicketTypesRepository = {
  findById: jest.fn(),
  decrementStock: jest.fn(),
  incrementStock: jest.fn(),
 };

 const mockStripeService = {
  createCheckoutSession: jest.fn(),
 };

 const mockDataSource = {
  transaction: jest.fn().mockImplementation(async (cb) => cb(mockManager)),
  manager: mockManager,
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    CreateOrderUseCase,
    { provide: OrdersRepository, useValue: mockOrdersRepository },
    { provide: TicketTypesRepository, useValue: mockTicketTypesRepository },
    { provide: StripeService, useValue: mockStripeService },
    { provide: DataSource, useValue: mockDataSource },
   ],
  }).compile();

  useCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
  ordersRepository = module.get<OrdersRepository>(OrdersRepository);
  ticketTypesRepository = module.get<TicketTypesRepository>(TicketTypesRepository);
  stripeService = module.get<StripeService>(StripeService);
  dataSource = module.get<DataSource>(DataSource);

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 describe('execute', () => {
  const userId = 'user-123';
  const dto = { ticketTypeId: 'ticket-1', quantity: 2 };
  const mockTicketType = { id: 'ticket-1', name: 'VIP', price: 150 };

  it('deve criar um pedido e retornar a URL de checkout com sucesso', async () => {
   mockTicketTypesRepository.findById.mockResolvedValueOnce(mockTicketType);
   mockOrdersRepository.createOrder.mockResolvedValueOnce({ id: 'order-1' });
   mockStripeService.createCheckoutSession.mockResolvedValueOnce({
    id: 'sess_1',
    url: 'https://stripe.com/pay'
   });

   const result = await useCase.execute(userId, dto);

   expect(mockTicketTypesRepository.decrementStock).toHaveBeenCalledWith(
    dto.ticketTypeId,
    dto.quantity,
    mockManager
   );

   expect(mockOrdersRepository.createOrder).toHaveBeenCalledWith({
    userId,
    ticketTypeId: dto.ticketTypeId,
    quantity: dto.quantity,
    unitPrice: 150,
    totalPrice: 300,
    status: OrderStatus.PENDING
   }, mockManager);

   expect(mockStripeService.createCheckoutSession).toHaveBeenCalled();
   expect(mockOrdersRepository.updateSessionId).toHaveBeenCalledWith(
    'order-1',
    'sess_1',
    mockDataSource.manager
   );

   expect(result).toEqual({
    orderId: 'order-1',
    checkoutUrl: 'https://stripe.com/pay'
   });
  });

  it('deve lançar NotFoundException se o lote de ingressos não existir', async () => {
   mockTicketTypesRepository.findById.mockResolvedValueOnce(null);

   await expect(useCase.execute(userId, dto)).rejects.toThrow(NotFoundException);
   expect(mockDataSource.transaction).not.toHaveBeenCalled();
  });

  it('deve propagar erro se o decrementStock falhar (ex: sem estoque)', async () => {
   mockTicketTypesRepository.findById.mockResolvedValueOnce(mockTicketType);
   const stockError = new Error('Out of stock');
   mockTicketTypesRepository.decrementStock.mockRejectedValueOnce(stockError);

   await expect(useCase.execute(userId, dto)).rejects.toThrow(stockError);
   expect(mockOrdersRepository.createOrder).not.toHaveBeenCalled();
  });

  it('deve propagar erro se a criação do pedido (createOrder) falhar dentro da transação', async () => {
   mockTicketTypesRepository.findById.mockResolvedValueOnce(mockTicketType);

   const dbError = new Error('Database Insert Failed');
   mockOrdersRepository.createOrder.mockRejectedValueOnce(dbError);

   await expect(useCase.execute(userId, dto)).rejects.toThrow(dbError);

   expect(mockStripeService.createCheckoutSession).not.toHaveBeenCalled();
  });

  it('deve executar a compensação e lançar InternalServerErrorException se o Stripe falhar', async () => {
   mockTicketTypesRepository.findById.mockResolvedValueOnce(mockTicketType);
   mockOrdersRepository.createOrder.mockResolvedValueOnce({ id: 'order-1' });

   const stripeError = new Error('Stripe integration failed');
   mockStripeService.createCheckoutSession.mockRejectedValueOnce(stripeError);

   const errorSpy = jest.spyOn(Logger.prototype, 'error');

   await expect(useCase.execute(userId, dto)).rejects.toThrow(
    new InternalServerErrorException('Falha ao iniciar processo de pagamento. Seu ingresso não foi reservado.')
   );

   expect(errorSpy).toHaveBeenCalledWith(
    'Erro no Stripe. Iniciando compensação...',
    stripeError
   );

   expect(mockTicketTypesRepository.incrementStock).toHaveBeenCalledWith(
    dto.ticketTypeId,
    dto.quantity,
    mockDataSource.manager
   );

   expect(mockOrdersRepository.updateStatus).toHaveBeenCalledWith(
    'order-1',
    OrderStatus.FAILED,
    mockDataSource.manager
   );
  });

  it('deve executar a compensação se o updateSessionId falhar', async () => {
   mockTicketTypesRepository.findById.mockResolvedValueOnce(mockTicketType);
   mockOrdersRepository.createOrder.mockResolvedValueOnce({ id: 'order-1' });

   mockStripeService.createCheckoutSession.mockResolvedValueOnce({
    id: 'sess_1',
    url: 'https://stripe.com/pay'
   });

   const updateError = new Error('Update Session Failed');
   mockOrdersRepository.updateSessionId.mockRejectedValueOnce(updateError);

   await expect(useCase.execute(userId, dto)).rejects.toThrow(
    new InternalServerErrorException('Falha ao iniciar processo de pagamento. Seu ingresso não foi reservado.')
   );

   expect(mockTicketTypesRepository.incrementStock).toHaveBeenCalledWith(
    dto.ticketTypeId,
    dto.quantity,
    mockDataSource.manager
   );

   expect(mockOrdersRepository.updateStatus).toHaveBeenCalledWith(
    'order-1',
    OrderStatus.FAILED,
    mockDataSource.manager
   );
  });
 });
});