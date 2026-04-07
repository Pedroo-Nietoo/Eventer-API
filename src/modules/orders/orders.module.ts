import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersRepository } from './repository/orders.repository';
import { OrdersController } from './controller/orders.controller';
import { TicketTypeModule } from '@ticket-types/ticket-type.module';
import { CreateOrderUseCase } from './usecase/create-order.usecase';
import { StripeService } from '@infra/stripe/stripe.service';
import { CompleteOrderUseCase } from './usecase/complete-order.usecase';
import { TicketsModule } from '@tickets/tickets.module';
import { FindOrderUseCase } from './usecase/find-order.usecase';
import { ListOrdersUseCase } from './usecase/list-orders.usecase';
import { UpdateOrderUseCase } from './usecase/update-order.usecase';
import { DeleteOrderUseCase } from './usecase/delete-order.usecase';
import { OrderExpirationCron } from './cron/order-expiration.cron';
import { OrderExpirationService } from '@services/order-expiration.service';
import { BullModule } from '@nestjs/bullmq';
import { OrdersProcessor } from './queue/order.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'orders-queue',
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'orders-queue',
      adapter: BullMQAdapter,
    }),
    TicketTypeModule,
    TicketsModule
  ],
  controllers: [
    OrdersController
  ],
  providers: [
    OrdersRepository,
    CreateOrderUseCase,
    CompleteOrderUseCase,
    FindOrderUseCase,
    ListOrdersUseCase,
    UpdateOrderUseCase,
    DeleteOrderUseCase,
    StripeService,
    OrderExpirationService,
    OrderExpirationCron,
    OrdersProcessor
  ],
  exports: [
    OrdersRepository,
  ],
})
export class OrdersModule { }