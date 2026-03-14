import {
 Injectable,
 NotFoundException,
 InternalServerErrorException,
 Logger,
 ConflictException,
} from '@nestjs/common';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventsRepository } from '../repository/events.repository';
import { EventMapper } from '../mappers/event.mapper';
import { EventResponseDto } from '../dto/event-response.dto';
import generateSlug from 'src/common/utils/generate-slug';

@Injectable()
export class UpdateEventUseCase {
 private readonly logger = new Logger(UpdateEventUseCase.name);

 constructor(private readonly eventsRepository: EventsRepository) { }

 async execute(id: string, dto: UpdateEventDto): Promise<EventResponseDto> {
  const event = await this.eventsRepository.findById(id);

  if (!event) {
   throw new NotFoundException(`Evento com ID ${id} não encontrado.`);
  }

  if (!dto || Object.keys(dto).length === 0) {
   return EventMapper.toResponse(event);
  }

  if (dto.slug) {
   dto.slug = generateSlug(dto.slug);
  }

  try {
   const updatedData: Partial<typeof event> = { ...dto };

   if (dto.latitude !== undefined && dto.longitude !== undefined) {
    updatedData.location = {
     type: 'Point',
     coordinates: [dto.longitude, dto.latitude],
    };
   }

   Object.assign(event, updatedData);

   const savedEvent = await this.eventsRepository.save(event);

   return EventMapper.toResponse(savedEvent);
  } catch (error) {
   if (error?.code === '23505' || error?.code === 'ER_DUP_ENTRY') {
    throw new ConflictException(
     'Conflito de dados no evento (slug já existente).',
    );
   }

   this.logger.error(
    `Erro ao atualizar evento ID=${id}`,
    error.stack,
   );

   throw new InternalServerErrorException(
    'Erro interno ao atualizar o evento.',
   );
  }
 }
}