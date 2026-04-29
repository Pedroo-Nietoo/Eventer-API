import { Test, TestingModule } from '@nestjs/testing';
import { CompleteOrderUseCase } from '@orders/use-cases/complete-order.usecase';
import { Job } from 'bullmq';
import { OrdersProcessor } from './order.processor';

describe('OrdersProcessor', () => {
  let processor: OrdersProcessor;
  let completeOrderUseCase: CompleteOrderUseCase;

  const mockCompleteOrderUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersProcessor,
        {
          provide: CompleteOrderUseCase,
          useValue: mockCompleteOrderUseCase,
        },
      ],
    }).compile();

    processor = module.get<OrdersProcessor>(OrdersProcessor);
    completeOrderUseCase = module.get<CompleteOrderUseCase>(CompleteOrderUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('deve extrair o orderId do job.data e chamar CompleteOrderUseCase.execute', async () => {
      const expectedOrderId = 'uuid-pedido-123';

      const mockJob = {
        data: {
          orderId: expectedOrderId,
        },
      } as Job<{ orderId: string }>;

      await processor.process(mockJob);

      expect(completeOrderUseCase.execute).toHaveBeenCalledTimes(1);
      expect(completeOrderUseCase.execute).toHaveBeenCalledWith(expectedOrderId);
    });
  });
});