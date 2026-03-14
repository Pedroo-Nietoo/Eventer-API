import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TicketStatus } from '../entities/ticket.entity';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
 @ApiPropertyOptional({
  enum: TicketStatus,
  example: TicketStatus.VALID,
  description: 'Status do ingresso: VALID, USED ou CANCELLED'
 })
 @IsOptional() @IsEnum(TicketStatus)
 status?: TicketStatus;
}