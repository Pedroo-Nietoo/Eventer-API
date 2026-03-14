import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateTicketResponseDto {
 @ApiProperty({ example: true })
 success: boolean;

 @ApiProperty({ example: 'Ingresso validado com sucesso!' })
 message: string;

 @ApiPropertyOptional({
  example: { id: 't-123', ticketTypeName: 'VIP' }
 })
 ticketData?: { id: string; ticketTypeName?: string };
}