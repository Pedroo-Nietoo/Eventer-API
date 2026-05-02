import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrdersRepository } from '@orders/repository/orders.repository';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { StripeService } from '@infra/stripe/stripe.service';
import { OrderStatus } from '@common/enums/order-status.enum';
import { CreateOrderDto } from '@orders/dto/create-order.dto';

@Injectable()
export class CreateOrderUseCase {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly ticketTypesRepository: TicketTypesRepository,
    private readonly stripeService: StripeService,
    private readonly dataSource: DataSource,
  ) { }

  async execute(userId: string, dto: CreateOrderDto) {
    const { ticketTypeId, quantity } = dto;

    const ticketType = await this.ticketTypesRepository.findById(ticketTypeId);
    if (!ticketType) {
      throw new NotFoundException('Lote de ingressos não encontrado.');
    }

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      await this.ticketTypesRepository.decrementStock(
        ticketTypeId,
        quantity,
        manager,
      );

      return await this.ordersRepository.createOrder(
        {
          userId,
          ticketTypeId,
          quantity,
          unitPrice: ticketType.price,
          totalPrice: ticketType.price * quantity,
          status: OrderStatus.PENDING,
        },
        manager,
      );
    });

    try {
      const session = await this.stripeService.createCheckoutSession(
        savedOrder.id,
        ticketType.name,
        ticketType.price,
        quantity,
      );

      await this.ordersRepository.updateSessionId(
        savedOrder.id,
        session.id,
        this.dataSource.manager,
      );

      return {
        orderId: savedOrder.id,
        checkoutUrl: session.url,
      };

    } catch (error) {
      this.logger.error('Erro no Stripe. Iniciando compensação...', error);

      await this.ticketTypesRepository.incrementStock(
        ticketTypeId,
        quantity,
        this.dataSource.manager,
      );

      await this.ordersRepository.updateStatus(
        savedOrder.id,
        OrderStatus.FAILED,
        this.dataSource.manager
      );

      throw new InternalServerErrorException(
        'Falha ao iniciar processo de pagamento. Seu ingresso não foi reservado.',
      );
    }
  }
}