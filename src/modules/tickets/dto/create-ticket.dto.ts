import { TicketType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Data Transfer Object for creating a ticket.
 */
export class CreateTicketDto {
  /**
   * The ID of the user creating the ticket.
   * @type {string}
   */
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  /**
   * The ID of the event for which the ticket is being created.
   * @type {string}
   */
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  /**
   * The type of the ticket.
   * @type {TicketType}
   */
  @IsNotEmpty()
  @IsEnum(TicketType)
  ticketType: TicketType;
}
