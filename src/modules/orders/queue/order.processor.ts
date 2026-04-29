import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { CompleteOrderUseCase } from '@orders/use-cases/complete-order.usecase';
import { Job } from 'bullmq';

@Processor('orders-queue')
export class OrdersProcessor extends WorkerHost {
  private readonly logger = new Logger(OrdersProcessor.name);

  constructor(private readonly completeOrderUseCase: CompleteOrderUseCase) {
    super();
  }

  async process(job: Job<{ orderId: string }>): Promise<any> {
    const { orderId } = job.data;

    try {
      await this.completeOrderUseCase.execute(orderId);
    } catch (error) {
      this.logger.error(
        `Erro ao processar Job de finalização do pedido ${orderId}:`,
        error,
      );
      throw error;
    }
  }
}
