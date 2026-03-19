import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '../usecase/create-order.usecase';
import { CompleteOrderUseCase } from '../usecase/complete-order.usecase';
import { FindOrderUseCase } from '../usecase/find-order.usecase';
import { ListOrdersUseCase } from '../usecase/list-orders.usecase';
import { UpdateOrderUseCase } from '../usecase/update-order.usecase';
import { DeleteOrderUseCase } from '../usecase/delete-order.usecase';
import { StripeService } from '../services/stripe.service';
import { OrdersController } from './orders.controller';

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
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});