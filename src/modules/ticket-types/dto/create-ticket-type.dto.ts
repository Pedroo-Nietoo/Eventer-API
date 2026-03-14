import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, Min, IsUUID } from 'class-validator';

export class CreateTicketTypeDto {
 @ApiProperty({ example: 'Lote VIP' })
 @IsString() @IsNotEmpty()
 name: string;

 @ApiPropertyOptional({ example: 'Entrada prioritária e brindes.' })
 @IsString() @IsOptional()
 description?: string;

 @ApiProperty({ example: 250.00 })
 @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
 price: number;

 @ApiProperty({ example: 50, description: 'Capacidade total deste lote' })
 @IsInt()
 totalQuantity: number;

 @ApiProperty({ example: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
 @IsUUID() @IsNotEmpty()
 eventId: string;
}