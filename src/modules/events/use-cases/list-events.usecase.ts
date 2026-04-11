import { Injectable } from '@nestjs/common';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { EventsRepository } from '@events/repository/events.repository';
import { EventResponseDto } from '@events/dto/event-response.dto';
import { EventMapper } from '@events/mappers/event.mapper';

@Injectable()
export class ListEventsUseCase {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<EventResponseDto>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const events = await this.eventsRepository.findAll(skip, limit);
    const total = await this.eventsRepository.count();

    return {
      data: EventMapper.toResponseList(events),
      meta: {
        totalItems: total,
        itemCount: events.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }
}
