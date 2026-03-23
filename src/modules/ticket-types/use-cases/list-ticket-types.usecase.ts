import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { TicketTypeMapper } from '../mappers/ticket-type.mapper';
import { TicketTypeResponseDto } from '../dto/ticket-type-response.dto';
import { TicketTypesRepository } from '../repository/ticket-type.repository';

@Injectable()
export class ListTicketTypesUseCase {
 constructor(private readonly ticketTypesRepository: TicketTypesRepository) { }

 async execute(paginationDto: PaginationDto): Promise<PaginatedResponse<TicketTypeResponseDto>> {
  const { page = 1, limit = 20 } = paginationDto;
  const skip = (page - 1) * limit;

  const [ticketTypes, total] = await this.ticketTypesRepository.findAllWithEvent(skip, limit);

  return {
   data: TicketTypeMapper.toResponseList(ticketTypes),
   meta: {
    totalItems: total,
    itemCount: ticketTypes.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
   },
  };
 }
}