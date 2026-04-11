import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CompleteOrderUseCase } from '@orders/use-cases/complete-order.usecase';
import { Job } from 'bullmq';

@Processor('orders-queue')
export class OrdersProcessor extends WorkerHost {
  constructor(private readonly completeOrderUseCase: CompleteOrderUseCase) {
    super();
  }

  async process(job: Job<{ orderId: string }>): Promise<any> {
    const { orderId } = job.data;

    await this.completeOrderUseCase.execute(orderId);
  }
}
