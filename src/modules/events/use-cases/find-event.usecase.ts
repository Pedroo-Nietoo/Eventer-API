import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsRepository } from '../repository/events.repository';
import { EventMapper } from '../mappers/event.mapper';
import { EventResponseDto } from '../dto/event-response.dto';

@Injectable()
export class FindEventUseCase {
 constructor(private readonly eventsRepository: EventsRepository) { }

 async execute(id: string): Promise<EventResponseDto> {
  const event = await this.eventsRepository.findById(id);

  if (!event) {
   throw new NotFoundException(`Evento com ID ${id} não encontrado.`);
  }

  return EventMapper.toResponse(event);
 }
}