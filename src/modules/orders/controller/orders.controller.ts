import { Controller, Post, Body, UseGuards, Headers, Req, BadRequestException, Logger, Get, Query, Param, ParseUUIDPipe, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { StripeService } from '../../../infra/stripe/stripe.service';
import { CompleteOrderUseCase } from '../usecase/complete-order.usecase';
import { CreateOrderUseCase } from '../usecase/create-order.usecase';
import { FindOrderUseCase } from '../usecase/find-order.usecase';
import { ListOrdersUseCase } from '../usecase/list-orders.usecase';
import { UpdateOrderUseCase } from '../usecase/update-order.usecase';
import { DeleteOrderUseCase } from '../usecase/delete-order.usecase';
import { SwaggerOrderController as Doc } from './orders.swagger';
import { UserRole } from 'src/common/enums/role.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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
  ) { }


  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.createOrderUseCase.execute(userId, createOrderDto);
  }

  @Public()
  @Post('webhook')
  async handleIncomingEvents(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    if (!signature) throw new BadRequestException('Missing stripe-signature header');

    let event;
    try {
      event = this.stripeService.constructEvent(req.rawBody, signature);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata.orderId;

      this.logger.log(`Encaminhando pedido ${orderId} para a fila de processamento.`);

      await this.ordersQueue.add('complete-order-job',
        { orderId },
        {
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { age: 3600, count: 1000 }, // Remove após 1 hora ou se passar de 1000 jobs
          removeOnFail: { age: 24 * 3600 } // Mantém falhas por 24h para análise
        }
      );
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