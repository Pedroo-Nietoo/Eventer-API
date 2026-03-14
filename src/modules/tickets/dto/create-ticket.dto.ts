import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateTicketDto {
 @ApiProperty({ example: '3869a378-d6d3-43af-afdf-19df31e5392d', description: 'ID do usuário proprietário do ingresso' })
 @IsUUID() @IsNotEmpty()
 userId: string;

 @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID do tipo de ingresso (lote)' })
 @IsUUID() @IsNotEmpty()
 ticketTypeId: string;

 @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'ID do evento' })
 @IsUUID() @IsNotEmpty()
 eventId: string;
}