import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersRepository } from './repository/orders.repository';
import { OrdersController } from './controller/orders.controller';
import { TicketTypeModule } from '@ticket-types/ticket-type.module';
import { CreateOrderUseCase } from './use-cases/create-order.usecase';
import { StripeService } from '@infra/stripe/stripe.service';
import { CompleteOrderUseCase } from './use-cases/complete-order.usecase';
import { TicketsModule } from '@tickets/tickets.module';
import { FindOrderUseCase } from './use-cases/find-order.usecase';
import { ListOrdersUseCase } from './use-cases/list-orders.usecase';
import { UpdateOrderUseCase } from './use-cases/update-order.usecase';
import { DeleteOrderUseCase } from './use-cases/delete-order.usecase';
import { OrderExpirationCron } from './cron/order-expiration.cron';
import { OrderExpirationService } from '@services/order-expiration.service';
import { BullModule } from '@nestjs/bullmq';
import { OrdersProcessor } from './queue/order.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const url = new URL(redisUrl);

        return {
          connection: {
            host: url.hostname,
            port: Number(url.port),
            username: url.username || undefined,
            password: url.password || undefined,
          },
        };
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
    TicketsModule,
  ],
  controllers: [OrdersController],
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
    OrdersProcessor,
  ],
  exports: [OrdersRepository],
})
export class OrdersModule {}
