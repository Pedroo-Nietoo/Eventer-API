import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { TicketTypeMapper } from '@ticket-types/mappers/ticket-type.mapper';
import { TicketTypeResponseDto } from '@ticket-types/dto/ticket-type-response.dto';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { CacheService } from '@infra/redis/services/cache.service';

@Injectable()
export class ListTicketTypesUseCase {
  constructor(
    private readonly ticketTypesRepository: TicketTypesRepository,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) { }

  async execute(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<TicketTypeResponseDto>> {
    const { page = 1, limit = 20 } = paginationDto;

    const cacheKey = `ticket-types:list:${page}:${limit}`;
    const cachedData = await this.cacheService.get<PaginatedResponse<TicketTypeResponseDto>>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const skip = (page - 1) * limit;

    const [ticketTypes, total] = await this.ticketTypesRepository.findAllWithEvent(skip, limit);

    const response = {
      data: TicketTypeMapper.toResponseList(ticketTypes),
      meta: {
        totalItems: total,
        itemCount: ticketTypes.length,
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