import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { OrdersRepository } from '../repository/orders.repository';
import { CreateOrderDto } from '../dto/create-order.dto';
import { TicketTypesRepository } from 'src/modules/ticket-types/repository/ticket-type.repository';
import { StripeService } from '../services/stripe.service';
import { OrderStatus } from 'src/common/enums/order-status.enum';

@Injectable()
export class CreateOrderUseCase {
 private readonly logger = new Logger(CreateOrderUseCase.name);

 constructor(
  private readonly ordersRepository: OrdersRepository,
  private readonly ticketTypesRepository: TicketTypesRepository,
  private readonly stripeService: StripeService,
 ) { }

 async execute(userId: string, dto: CreateOrderDto) {
  const { ticketTypeId, quantity } = dto;

  const ticketType = await this.ticketTypesRepository.findById(ticketTypeId);
  if (!ticketType) {
   throw new NotFoundException('Tipo de ingresso não encontrado.');
  }

  if (ticketType.availableQuantity < quantity) {
   throw new BadRequestException('Quantidade de ingressos indisponível.');
  }

  const totalPrice = ticketType.price * quantity;

  try {
   const order = this.ordersRepository.create({
    userId,
    ticketTypeId,
    quantity,
    unitPrice: ticketType.price,
    totalPrice: totalPrice,
    status: OrderStatus.PENDING
   });
   const savedOrder = await this.ordersRepository.save(order);

   const session = await this.stripeService.createCheckoutSession(
    savedOrder.id,
    ticketType.name,
    ticketType.price,
    quantity
   );

   await this.ordersRepository.updateSessionId(savedOrder.id, session.id);

   //todo Retornar um OrderMap.toResponse aqui depois, mas por enquanto só o necessário pro frontend iniciar o checkout
   return {
    orderId: savedOrder.id,
    checkoutUrl: session.url
   };
  } catch (error) {
   this.logger.error('Erro ao criar pedido e sessão de checkout', error);
   throw new InternalServerErrorException('Erro interno ao iniciar pagamento.');
  }
 }
}