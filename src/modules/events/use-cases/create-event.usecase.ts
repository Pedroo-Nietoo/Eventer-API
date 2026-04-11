import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import generateSlug from '@common/utils/generate-slug';
import { EventsRepository } from '@events/repository/events.repository';
import { EventResponseDto } from '@events/dto/event-response.dto';
import { CreateEventDto } from '@events/dto/create-event.dto';
import { EventMapper } from '@events/mappers/event.mapper';
import { DatabaseError } from '@common/interfaces/database-error.interface';

@Injectable()
export class CreateEventUseCase {
  private readonly logger = new Logger(CreateEventUseCase.name);

  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(
    dto: CreateEventDto,
    organizerId: string,
  ): Promise<EventResponseDto> {
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
    } catch (error: unknown) {
      const dbError = error as DatabaseError;

      if (dbError.code === '23505' || dbError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('O slug deste evento já existe.');
      }

      this.logger.error('Erro ao criar evento', error);
      throw new InternalServerErrorException('Erro interno ao criar evento.');
    }
  }
}
