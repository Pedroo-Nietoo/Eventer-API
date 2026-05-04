import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventResponseDto } from '@events/dto/event-response.dto';
import { EventMapper } from '@events/mappers/event.mapper';
import { EventsRepository } from '@events/repository/events.repository';
import { CacheService } from '@infra/redis/services/cache.service';

@Injectable()
export class FindEventBySlugUseCase {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {}

  async execute(slug: string): Promise<EventResponseDto> {
    const cacheKey = `events:slug:${slug}`;

    const cachedEvent = await this.cacheService.get<EventResponseDto>(cacheKey);
    if (cachedEvent) {
      return cachedEvent;
    }

    const event = await this.eventsRepository.findBySlug(slug);

    if (!event) {
      throw new NotFoundException(`Evento com slug ${slug} não encontrado.`);
    }

    const response = EventMapper.toResponse(event);

    const ttl = this.configService.get<number>('CACHE_TTL', 300);
    await this.cacheService.set(cacheKey, response, ttl);

    return response;
  }
}
