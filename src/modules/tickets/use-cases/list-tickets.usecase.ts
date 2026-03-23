import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { TicketMapper } from '../mappers/ticket.mapper';
import { TicketsRepository } from '../repository/ticket.repository';
import { TicketResponseDto } from '../dto/ticket-response.dto';

@Injectable()
export class ListTicketsUseCase {
 constructor(private readonly ticketsRepository: TicketsRepository) { }

 async execute(paginationDto: PaginationDto): Promise<PaginatedResponse<TicketResponseDto>> {
  const { page = 1, limit = 20 } = paginationDto;
  const skip = (page - 1) * limit;

  const [tickets, total] = await this.ticketsRepository.findAllWithRelations(skip, limit);

  return {
   data: TicketMapper.toResponseList(tickets),
   meta: {
    totalItems: total,
    itemCount: tickets.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
   },
  };
 }
}