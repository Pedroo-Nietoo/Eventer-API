import { IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID do tipo de ingresso (TicketType)' })
  @IsUUID()
  ticketTypeId: string;

  @ApiProperty({ description: 'Quantidade de ingressos desejada', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
