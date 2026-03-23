import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CompleteOrderUseCase } from '../usecase/complete-order.usecase';

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