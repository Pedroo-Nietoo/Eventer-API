import { IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, Min, IsUUID } from 'class-validator';

export class CreateTicketTypeDto {
 @IsString()
 @IsNotEmpty()
 name: string;

 @IsString()
 @IsOptional()
 description?: string;

 @IsNumber({ maxDecimalPlaces: 2 })
 @Min(0)
 price: number;

 @IsInt()
 @Min(1)
 totalQuantity: number;

 @IsUUID()
 @IsNotEmpty()
 eventId: string;
}