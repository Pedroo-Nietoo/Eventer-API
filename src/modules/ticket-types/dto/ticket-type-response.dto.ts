import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TicketTypeResponseDto {
 @ApiProperty({ example: 'b8e9a378-d6d3-43af-afdf-19df31e5392d' })
 id: string;

 @ApiProperty({ example: 'Lote VIP - 1º Lote' })
 name: string;

 @ApiPropertyOptional({ example: 'Acesso exclusivo à área VIP e open bar.' })
 description?: string;

 @ApiProperty({ example: 150.50 })
 price: number;

 @ApiProperty({ example: 100, description: 'Quantidade total de ingressos criados' })
 totalQuantity: number;

 @ApiProperty({ example: 85, description: 'Quantidade de ingressos ainda disponíveis para venda' })
 availableQuantity: number;

 @ApiProperty()
 createdAt: Date;

 @ApiProperty()
 updatedAt: Date;

 @ApiPropertyOptional({ example: { id: 'event-uuid-123' } })
 event?: { id: string };
}