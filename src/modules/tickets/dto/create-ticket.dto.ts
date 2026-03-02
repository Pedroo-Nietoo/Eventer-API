import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateTicketDto {
 @IsUUID()
 @IsNotEmpty()
 userId: string;

 @IsUUID()
 @IsNotEmpty()
 ticketTypeId: string;

 @IsUUID()
 @IsNotEmpty()
 eventId: string;
}