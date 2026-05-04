import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { EventsRepository } from '@events/repository/events.repository';
import { EventResponseDto } from '@events/dto/event-response.dto';
import { EventMapper } from '@events/mappers/event.mapper';
import { CacheService } from '@infra/redis/services/cache.service';

@Injectable()
export class ListEventsUseCase {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<EventResponseDto>> {
    const { page = 1, limit = 20 } = paginationDto;

    const cacheKey = `events:list:${page}:${limit}`;
    const cachedData =
      await this.cacheService.get<PaginatedResponse<EventResponseDto>>(
        cacheKey,
      );

    if (cachedData) {
      return cachedData;
    }

    const skip = (page - 1) * limit;
    const events = await this.eventsRepository.findAll(skip, limit);
    const total = await this.eventsRepository.count();

    const response = {
      data: EventMapper.toResponseList(events),
      meta: {
        totalItems: total,
        itemCount: events.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };

    const ttl = this.configService.get<number>('CACHE_TTL', 300);
    await this.cacheService.set(cacheKey, response, ttl);

    return response;
  }
}
