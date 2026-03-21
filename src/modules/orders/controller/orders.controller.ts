import { Controller, Post, Body, UseGuards, Headers, Req, BadRequestException, Logger, Get, Query, Param, ParseUUIDPipe, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
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

@Doc.Main()
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly completeOrderUseCase: CompleteOrderUseCase,
    private readonly findOrderUseCase: FindOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
    private readonly stripeService: StripeService,
  ) { }

  @Doc.Create()
  @Post()
  createOrder(
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
    @Req() req: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event;

    try {
      event = this.stripeService.constructEvent(req.rawBody, signature);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed.`, err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata.orderId;

      this.logger.log(`Processando pagamento concluído para o pedido: ${orderId}`);

      await this.completeOrderUseCase.execute(orderId);
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