import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsRepository } from '../repository/events.repository';
import { EventMapper } from '../mappers/event.mapper';
import { EventResponseDto } from '../dto/event-response.dto';

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