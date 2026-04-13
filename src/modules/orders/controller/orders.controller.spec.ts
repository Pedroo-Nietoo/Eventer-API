import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { CreateOrderUseCase } from '@orders/use-cases/create-order.usecase';
import { FindOrderUseCase } from '@orders/use-cases/find-order.usecase';
import { ListOrdersUseCase } from '@orders/use-cases/list-orders.usecase';
import { UpdateOrderUseCase } from '@orders/use-cases/update-order.usecase';
import { DeleteOrderUseCase } from '@orders/use-cases/delete-order.usecase';
import { StripeService } from '@infra/stripe/stripe.service';
import { getQueueToken } from '@nestjs/bullmq';
import { BadRequestException } from '@nestjs/common';
import { UserRole } from '@common/enums/role.enum';

describe('OrdersController', () => {
  let controller: OrdersController;
  let createOrderUseCase: CreateOrderUseCase;
  let findOrderUseCase: FindOrderUseCase;
  let listOrdersUseCase: ListOrdersUseCase;
  let updateOrderUseCase: UpdateOrderUseCase;
  let deleteOrderUseCase: DeleteOrderUseCase;
  let stripeService: StripeService;
  let ordersQueue: any;

  const mockCreateOrderUseCase = { execute: jest.fn() };
  const mockFindOrderUseCase = { execute: jest.fn() };
  const mockListOrdersUseCase = { execute: jest.fn() };
  const mockUpdateOrderUseCase = { execute: jest.fn() };
  const mockDeleteOrderUseCase = { execute: jest.fn() };
  const mockStripeService = { constructEvent: jest.fn() };
  const mockOrdersQueue = { add: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: CreateOrderUseCase, useValue: mockCreateOrderUseCase },
        { provide: FindOrderUseCase, useValue: mockFindOrderUseCase },
        { provide: ListOrdersUseCase, useValue: mockListOrdersUseCase },
        { provide: UpdateOrderUseCase, useValue: mockUpdateOrderUseCase },
        { provide: DeleteOrderUseCase, useValue: mockDeleteOrderUseCase },
        { provide: StripeService, useValue: mockStripeService },
        { provide: getQueueToken('orders-queue'), useValue: mockOrdersQueue },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    createOrderUseCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    findOrderUseCase = module.get<FindOrderUseCase>(FindOrderUseCase);
    listOrdersUseCase = module.get<ListOrdersUseCase>(ListOrdersUseCase);
    updateOrderUseCase = module.get<UpdateOrderUseCase>(UpdateOrderUseCase);
    deleteOrderUseCase = module.get<DeleteOrderUseCase>(DeleteOrderUseCase);
    stripeService = module.get<StripeService>(StripeService);
    ordersQueue = module.get(getQueueToken('orders-queue'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('deve chamar CreateOrderUseCase.execute com o userId e DTO corretos', async () => {
      const dto: any = { ticketTypeId: 'type-1', quantity: 2 };
      const userId = 'user-uuid-123';
      const expectedResult: any = { orderId: 'order-1', checkoutUrl: 'http://url' };

      mockCreateOrderUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.createOrder(dto, userId);

      expect(createOrderUseCase.execute).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('handleIncomingEvents', () => {
    it('deve lançar BadRequestException se não houver assinatura', async () => {
      const req: any = { rawBody: Buffer.from('data') };

      await expect(controller.handleIncomingEvents('', req)).rejects.toThrow(
        new BadRequestException('Missing stripe-signature header'),
      );
    });

    it('deve lançar BadRequestException se a verificação da assinatura falhar', async () => {
      const req: any = { rawBody: Buffer.from('data') };
      mockStripeService.constructEvent.mockImplementation(() => {
        throw new Error('Invalid payload');
      });

      await expect(
        controller.handleIncomingEvents('invalid-sig', req),
      ).rejects.toThrow(new BadRequestException('Webhook Error: Invalid payload'));
    });

    it('deve adicionar job na fila se o evento for checkout.session.completed com orderId', async () => {
      const req: any = { rawBody: Buffer.from('data') };
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { orderId: 'order-uuid-123' },
          },
        },
      };

      mockStripeService.constructEvent.mockReturnValue(mockEvent);

      const result = await controller.handleIncomingEvents('valid-sig', req);

      expect(ordersQueue.add).toHaveBeenCalledWith(
        'complete-order-job',
        { orderId: 'order-uuid-123' },
        expect.any(Object),
      );
      expect(result).toEqual({ received: true });
    });

    it('não deve adicionar na fila para outros tipos de evento e retornar received true', async () => {
      const req: any = { rawBody: Buffer.from('data') };
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: { object: {} },
      };

      mockStripeService.constructEvent.mockReturnValue(mockEvent);

      const result = await controller.handleIncomingEvents('valid-sig', req);

      expect(ordersQueue.add).not.toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });
  });

  describe('findAll', () => {
    it('deve chamar ListOrdersUseCase.execute com a paginação correta', async () => {
      const paginationDto: any = { page: 1, limit: 10 };
      const expectedResult: any = { data: [], meta: { totalItems: 0 } };

      mockListOrdersUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(listOrdersUseCase.execute).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('deve chamar FindOrderUseCase.execute com ID, userId e role corretos', async () => {
      const id = 'order-uuid-123';
      const userId = 'user-uuid-123';
      const role = UserRole.USER;
      const expectedResult: any = { id, status: 'PENDING' };

      mockFindOrderUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, userId, role);

      expect(findOrderUseCase.execute).toHaveBeenCalledWith(id, userId, role);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('deve chamar UpdateOrderUseCase.execute com o ID e DTO corretos', async () => {
      const id = 'order-uuid-123';
      const dto: any = { status: 'CANCELLED' };
      const expectedResult: any = { id, status: 'CANCELLED' };

      mockUpdateOrderUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.update(id, dto);

      expect(updateOrderUseCase.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('deve chamar DeleteOrderUseCase.execute com o ID correto', async () => {
      const id = 'order-uuid-123';

      mockDeleteOrderUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(deleteOrderUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toBeUndefined();
    });
  });
});