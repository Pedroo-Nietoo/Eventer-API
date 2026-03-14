import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketMapper } from '../mappers/ticket.mapper';
import { TicketResponseDto } from '../dto/ticket-response.dto';
import { TicketsRepository } from '../repository/ticket.repository';

@Injectable()
export class FindTicketUseCase {
 constructor(private readonly ticketsRepository: TicketsRepository) { }

 async execute(id: string): Promise<TicketResponseDto> {
  const ticket = await this.ticketsRepository.findByIdWithRelations(id);

  if (!ticket) {
   throw new NotFoundException('Ingresso não encontrado.');
  }

  return TicketMapper.toResponse(ticket);
 }
}