import { TicketType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @IsNotEmpty()
  @IsEnum(TicketType)
  ticketType: TicketType;
}
