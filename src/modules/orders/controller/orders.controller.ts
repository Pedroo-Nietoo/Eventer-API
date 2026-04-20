import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  BadRequestException,
  Logger,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { StripeService } from '@infra/stripe/stripe.service';
import { SwaggerOrderController as Doc } from './orders.swagger';
import { UserRole } from '@common/enums/role.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateOrderUseCase } from '@orders/use-cases/create-order.usecase';
import { FindOrderUseCase } from '@orders/use-cases/find-order.usecase';
import { ListOrdersUseCase } from '@orders/use-cases/list-orders.usecase';
import { UpdateOrderUseCase } from '@orders/use-cases/update-order.usecase';
import { DeleteOrderUseCase } from '@orders/use-cases/delete-order.usecase';
import { CreateOrderDto } from '@orders/dto/create-order.dto';
import { UpdateOrderDto } from '@orders/dto/update-order.dto';
import type Stripe from 'stripe';
import type { StripeRequest } from '@common/interfaces/stripe-request.interface';

@Doc.Main()
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly findOrderUseCase: FindOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
    private readonly stripeService: StripeService,
    @InjectQueue('orders-queue') private readonly ordersQueue: Queue,
  ) {}

  @Doc.Create()
  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.createOrderUseCase.execute(userId, createOrderDto);
  }

  @Doc.Webhook()
  @Public()
  @Post('webhook')
  async handleIncomingEvents(
    @Headers('stripe-signature') signature: string,
    @Req() req: StripeRequest,
  ) {
    if (!signature)
      throw new BadRequestException('Missing stripe-signature header');

    let event: Stripe.Event;
    try {
      event = this.stripeService.constructEvent(req.rawBody, signature);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Webhook signature verification failed: ${message}`);
      throw new BadRequestException(`Webhook Error: ${message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        this.logger.log(
          `Encaminhando pedido ${orderId} para a fila de processamento.`,
        );

        await this.ordersQueue.add(
          'complete-order-job',
          { orderId },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: { age: 3600, count: 1000 },
            removeOnFail: { age: 24 * 3600 },
          },
        );
      }
    }

    return { received: true };
  }

  @Doc.FindAll()
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.listOrdersUseCase.execute(paginationDto);
  }

  @Doc.FindOne()
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.findOrderUseCase.execute(id, userId, role);
  }

  @Doc.Update()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.updateOrderUseCase.execute(id, updateOrderDto);
  }

  @Doc.Delete()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteOrderUseCase.execute(id);
  }
}
