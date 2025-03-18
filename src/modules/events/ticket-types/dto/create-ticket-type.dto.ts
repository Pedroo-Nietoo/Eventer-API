import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

/**
 * Data Transfer Object for creating an ticket type.
 */
export class CreateTicketTypeDto {
  /**
   * The ID of the event for which the ticket type is being created.
   * @type {string}
   */
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  /**
   * The name of the ticket type.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * The price of the ticket type.
   * @type {number}
   */
  @IsNotEmpty()
  @IsNumber()
  price: number;

  /**
   * The number of tickets available for this ticket type.
   * @type {number}
   */
  @IsNotEmpty()
  @IsNumber()
  ticketCount: number;
}
