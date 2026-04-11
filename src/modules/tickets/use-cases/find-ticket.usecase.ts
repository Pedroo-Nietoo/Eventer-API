import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketMapper } from '@tickets/mappers/ticket.mapper';
import { TicketResponseDto } from '@tickets/dto/ticket-response.dto';
import { TicketsRepository } from '@tickets/repository/ticket.repository';

@Injectable()
export class FindTicketUseCase {
  constructor(private readonly ticketsRepository: TicketsRepository) {}

  async execute(id: string): Promise<TicketResponseDto> {
    const ticket = await this.ticketsRepository.findByIdWithRelations(id);

    if (!ticket) {
      throw new NotFoundException('Ingresso não encontrado.');
    }

    return TicketMapper.toResponse(ticket);
  }
}
