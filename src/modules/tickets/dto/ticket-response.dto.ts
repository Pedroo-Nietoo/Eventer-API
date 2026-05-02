import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus } from '@tickets/entities/ticket.entity';

export class TicketResponseDto {
  @ApiProperty({ example: 'f39b6f84-7e5d-4a1e-9b3b-1f0e5a6d7c8b' })
  id: string;

  @ApiProperty({ description: 'Token que compõe o QR Code' })
  qrCode: string;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.VALID })
  status: TicketStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    example: { id: 'u-123', username: 'johndoe', email: 'john@email.com' },
  })
  user: { id: string; username?: string; email?: string };

  @ApiProperty({
    example: {
      id: 'tt-456',
      name: 'Lote VIP',
      price: 150.99,
      event: { id: 'e-789', title: 'Eventer Festival' },
    },
  })
  ticketType: {
    id: string;
    name?: string;
    price?: number;
    event?: { id: string; title?: string };
  };

  @ApiPropertyOptional({ example: 150.99 })
  purchasePrice?: number;
}
