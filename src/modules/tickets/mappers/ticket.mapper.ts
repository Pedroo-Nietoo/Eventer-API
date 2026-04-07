import { Ticket } from '@tickets/entities/ticket.entity';
import { TicketResponseDto } from '@tickets/dto/ticket-response.dto';

export class TicketMapper {
 static toResponse(entity: Ticket): TicketResponseDto {
  return {
   id: entity.id,
   qrCode: entity.qrCode,
   status: entity.status,
   createdAt: entity.createdAt,
   user: {
    id: entity.user?.id,
    username: entity.user?.username,
    email: entity.user?.email,
   },
   ticketType: {
    id: entity.ticketType?.id,
    name: entity.ticketType?.name,
    price: entity.ticketType?.price,
    event: entity.ticketType?.event ? {
     id: entity.ticketType.event.id,
     title: entity.ticketType.event.title,
    } : undefined,
   },
   purchasePrice: entity.purchasePrice,
  };
 }

 static toResponseList(entities: Ticket[]): TicketResponseDto[] {
  return entities.map((entity) => this.toResponse(entity));
 }
}