import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TicketTypeMapper } from '@ticket-types/mappers/ticket-type.mapper';
import { TicketTypeResponseDto } from '@ticket-types/dto/ticket-type-response.dto';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { CacheService } from '@infra/redis/services/cache.service';

@Injectable()
export class FindTicketTypeUseCase {
  constructor(
    private readonly ticketTypesRepository: TicketTypesRepository,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {}

  async execute(id: string): Promise<TicketTypeResponseDto> {
    const cacheKey = `ticket-types:id:${id}`;

    const cachedData =
      await this.cacheService.get<TicketTypeResponseDto>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const ticketType = await this.ticketTypesRepository.findById(id);

    if (!ticketType) {
      throw new NotFoundException('Tipo de ingresso não encontrado.');
    }

    const response = TicketTypeMapper.toResponse(ticketType);

    const ttl = this.configService.get<number>('CACHE_TTL', 300);
    await this.cacheService.set(cacheKey, response, ttl);

    return response;
  }
}
