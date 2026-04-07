import { EventResponseDto } from '@events/dto/event-response.dto';
import { EventMapper } from '@events/mappers/event.mapper';
import { EventsRepository } from '@events/repository/events.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FindEventBySlugUseCase {
 constructor(private readonly eventsRepository: EventsRepository) { }

 async execute(slug: string): Promise<EventResponseDto> {
  const event = await this.eventsRepository.findBySlug(slug);

  if (!event) {
   throw new NotFoundException(`Evento com slug ${slug} não encontrado.`);
  }

  return EventMapper.toResponse(event);
 }
}