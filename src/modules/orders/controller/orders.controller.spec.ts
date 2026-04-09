import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '@orders/use-cases/create-order.usecase';
import { CompleteOrderUseCase } from '@orders/use-cases/complete-order.usecase';
import { FindOrderUseCase } from '@orders/use-cases/find-order.usecase';
import { ListOrdersUseCase } from '@orders/use-cases/list-orders.usecase';
import { UpdateOrderUseCase } from '@orders/use-cases/update-order.usecase';
import { DeleteOrderUseCase } from '@orders/use-cases/delete-order.usecase';
import { StripeService } from '@infra/stripe/stripe.service';
import { OrdersController } from './orders.controller';
import { getQueueToken } from '@nestjs/bullmq';

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: CreateOrderUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CompleteOrderUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindOrderUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListOrdersUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateOrderUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteOrderUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: StripeService,
          useValue: { constructEvent: jest.fn() },
        },
        {
          provide: getQueueToken('orders-queue'),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});