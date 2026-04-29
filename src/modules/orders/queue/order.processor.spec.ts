import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CompleteOrderUseCase } from '@orders/use-cases/complete-order.usecase';
import { Job } from 'bullmq';
import { OrdersProcessor } from './order.processor';

describe('OrdersProcessor', () => {
  let processor: OrdersProcessor;
  let completeOrderUseCase: CompleteOrderUseCase;
  let loggerErrorSpy: jest.SpyInstance;

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

    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    const orderId = 'uuid-pedido-123';
    const mockJob = {
      data: { orderId },
    } as Job<{ orderId: string }>;

    it('deve extrair o orderId e finalizar o pedido com sucesso', async () => {
      mockCompleteOrderUseCase.execute.mockResolvedValueOnce(undefined);

      await processor.process(mockJob);

      expect(completeOrderUseCase.execute).toHaveBeenCalledTimes(1);
      expect(completeOrderUseCase.execute).toHaveBeenCalledWith(orderId);
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('deve logar o erro e relançar a exceção para o BullMQ em caso de falha', async () => {
      const error = new Error('Falha técnica no Use Case');
      mockCompleteOrderUseCase.execute.mockRejectedValueOnce(error);

      await expect(processor.process(mockJob)).rejects.toThrow(error);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Erro ao processar Job de finalização do pedido ${orderId}:`),
        error
      );
    });
  });
});