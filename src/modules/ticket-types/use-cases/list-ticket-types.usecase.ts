import { Injectable } from '@nestjs/common';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { TicketTypeMapper } from '@ticket-types/mappers/ticket-type.mapper';
import { TicketTypeResponseDto } from '@ticket-types/dto/ticket-type-response.dto';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';

@Injectable()
export class ListTicketTypesUseCase {
  constructor(private readonly ticketTypesRepository: TicketTypesRepository) {}

  async execute(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<TicketTypeResponseDto>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [ticketTypes, total] =
      await this.ticketTypesRepository.findAllWithEvent(skip, limit);

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
