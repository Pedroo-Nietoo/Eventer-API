import { TicketType } from '@ticket-types/entities/ticket-type.entity';
import { TicketTypeResponseDto } from '@ticket-types/dto/ticket-type-response.dto';

export class TicketTypeMapper {
  static toResponse(entity: TicketType): TicketTypeResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      totalQuantity: entity.totalQuantity,
      availableQuantity: entity.availableQuantity,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      event: entity.event ? { id: entity.event.id } : undefined,
    };
  }

  static toResponseList(entities: TicketType[]): TicketTypeResponseDto[] {
    return entities.map((entity) => this.toResponse(entity));
  }
}
