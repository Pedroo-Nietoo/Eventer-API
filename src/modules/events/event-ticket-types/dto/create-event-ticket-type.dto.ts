import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateEventTicketTypeDto {
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  ticketCount: number;
}
