import { OrderResponseDto } from '@orders/dto/order-response.dto';
import { Order } from '@orders/entities/order.entity';

export class OrderMapper {
  static toResponse(entity: Order): OrderResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      ticketTypeId: entity.ticketTypeId,
      quantity: entity.quantity,
      unitPrice: Number(entity.unitPrice),
      totalPrice: Number(entity.totalPrice),
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(entities: Order[]): OrderResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }
}
