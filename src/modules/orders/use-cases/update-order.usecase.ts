import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateOrderDto } from '@orders/dto/update-order.dto';
import { OrdersRepository } from '@orders/repository/orders.repository';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { OrderMapper } from '@orders/mappers/order.mapper';
import { OrderResponseDto } from '@orders/dto/order-response.dto';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Order } from '@orders/entities/order.entity'; // <-- Importação adicionada

@Injectable()
export class UpdateOrderUseCase {
  private readonly logger = new Logger(UpdateOrderUseCase.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly ticketTypesRepository: TicketTypesRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(id: string, dto: UpdateOrderDto): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findById(id);

    if (!order) {
      throw new NotFoundException(`Pedido com o ID ${id} não encontrado.`);
    }

    if (!dto || Object.keys(dto).length === 0) {
      return OrderMapper.toResponse(order);
    }

    try {
      const oldStatus = order.status;
      const newStatus = dto.status;

      if (!newStatus || oldStatus === newStatus) {
        Object.assign(order, dto);
        const savedOrder = await this.ordersRepository.save(order);
        return OrderMapper.toResponse(savedOrder);
      }

      if (
        oldStatus === OrderStatus.PAID &&
        ![OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(newStatus)
      ) {
        throw new BadRequestException(
          'Um pedido pago só pode ser alterado para CANCELLED ou REFUNDED.',
        );
      }

      const needsToReturnStock =
        [OrderStatus.PENDING, OrderStatus.PAID].includes(oldStatus) &&
        [
          OrderStatus.CANCELLED,
          OrderStatus.EXPIRED,
          OrderStatus.FAILED,
          OrderStatus.REFUNDED,
        ].includes(newStatus);

      let savedOrder: Order;

      if (needsToReturnStock) {
        savedOrder = await this.dataSource.transaction(async (manager) => {
          await this.ticketTypesRepository.incrementStock(
            order.ticketTypeId,
            order.quantity,
            manager,
          );

          Object.assign(order, dto);
          return await manager.save(order);
        });
      } else {
        Object.assign(order, dto);
        savedOrder = await this.ordersRepository.save(order);
      }

      return OrderMapper.toResponse(savedOrder);
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.stack : 'Sem stack trace disponível';
      this.logger.error(`Erro ao atualizar pedido ID=${id}`, errorMessage);

      throw new InternalServerErrorException(
        'Erro interno ao atualizar o pedido.',
      );
    }
  }
}
