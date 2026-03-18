import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import generateSlug from 'src/common/utils/generate-slug';

import { CreateEventDto } from '../dto/create-event.dto';
import { EventResponseDto } from '../dto/event-response.dto';
import { EventMapper } from '../mappers/event.mapper';
import { EventsRepository } from '../repository/events.repository';

@Injectable()
export class CreateEventUseCase {
 private readonly logger = new Logger(CreateEventUseCase.name);

 constructor(private readonly eventsRepository: EventsRepository) { }

 async execute(dto: CreateEventDto, organizerId: string): Promise<EventResponseDto> {
  try {
   const slug = `${generateSlug(dto.title)}-${createId()}`;

   const event = this.eventsRepository.create({
    ...dto,
    slug,
    organizerId,
    location: {
     type: 'Point',
     coordinates: [dto.longitude, dto.latitude],
    },
   });

   const savedEvent = await this.eventsRepository.save(event);

   return EventMapper.toResponse(savedEvent);
  } catch (error) {
   if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
    throw new ConflictException('O slug deste evento já existe.');
   }

   this.logger.error('Erro ao criar evento', error);
   throw new InternalServerErrorException('Erro interno ao criar evento.');
  }
 }
}