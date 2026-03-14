import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketTypeMapper } from '../mappers/ticket-type.mapper';
import { TicketTypeResponseDto } from '../dto/ticket-type-response.dto';
import { TicketTypesRepository } from '../repository/ticket-type.repository';

@Injectable()
export class FindTicketTypeUseCase {
 constructor(private readonly ticketTypesRepository: TicketTypesRepository) { }

 async execute(id: string): Promise<TicketTypeResponseDto> {
  const ticketType = await this.ticketTypesRepository.findById(id);

  if (!ticketType) {
   throw new NotFoundException('Tipo de ingresso não encontrado.');
  }

  return TicketTypeMapper.toResponse(ticketType);
 }
}