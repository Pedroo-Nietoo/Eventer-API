import { EventResponseDto } from '@events/dto/event-response.dto';
import { EventMapper } from '@events/mappers/event.mapper';
import { EventsRepository } from '@events/repository/events.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

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