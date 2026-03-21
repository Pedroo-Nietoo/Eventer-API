import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersRepository } from './repository/orders.repository';
import { OrdersController } from './controller/orders.controller';
import { TicketTypeModule } from '../ticket-types/ticket-type.module';
import { CreateOrderUseCase } from './usecase/create-order.usecase';
import { StripeService } from '../../infra/stripe/stripe.service';
import { CompleteOrderUseCase } from './usecase/complete-order.usecase';
import { TicketsModule } from '../tickets/tickets.module';
import { FindOrderUseCase } from './usecase/find-order.usecase';
import { ListOrdersUseCase } from './usecase/list-orders.usecase';
import { UpdateOrderUseCase } from './usecase/update-order.usecase';
import { DeleteOrderUseCase } from './usecase/delete-order.usecase';
import { OrderExpirationCron } from './cron/order-expiration.cron';
import { OrderExpirationService } from 'src/services/order-expiration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
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
  ],
  exports: [
    OrdersRepository,
  ],
})
export class OrdersModule { }