import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import generateSlug from '@common/utils/generate-slug';
import { UserRole } from '@common/enums/role.enum';
import { EventsRepository } from '@events/repository/events.repository';
import { UpdateEventDto } from '@events/dto/update-event.dto';
import { EventResponseDto } from '@events/dto/event-response.dto';
import { EventMapper } from '@events/mappers/event.mapper';
import { DatabaseError } from '@common/interfaces/database-error.interface';
import { CacheService } from '@infra/redis/services/cache.service';

@Injectable()
export class UpdateEventUseCase {
  private readonly logger = new Logger(UpdateEventUseCase.name);

  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    id: string,
    dto: UpdateEventDto,
    userId: string,
    userRole: UserRole,
  ): Promise<EventResponseDto> {
    try {
      const event = await this.eventsRepository.findById(id);

      if (!event) {
        throw new NotFoundException(`Evento com ID ${id} não encontrado.`);
      }

      if (event.organizerId !== userId && userRole !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'Você não tem permissão para editar este evento.',
        );
      }

      if (!dto || Object.keys(dto).length === 0) {
        return EventMapper.toResponse(event);
      }

      const oldSlug = event.slug;

      if (dto.slug) {
        dto.slug = generateSlug(dto.slug);
      }

      if (dto.latitude !== undefined || dto.longitude !== undefined) {
        if (dto.latitude === undefined || dto.longitude === undefined) {
          throw new BadRequestException(
            'Para atualizar a localização, forneça latitude e longitude.',
          );
        }
      }

      const updatedData: Partial<typeof event> = { ...dto };

      if (dto.latitude !== undefined && dto.longitude !== undefined) {
        updatedData.location = {
          type: 'Point',
          coordinates: [dto.longitude, dto.latitude],
        };
      }

      Object.assign(event, updatedData);

      const savedEvent = await this.eventsRepository.save(event);

      await Promise.all([
        this.cacheService.del(`events:id:${id}`),
        this.cacheService.del(`events:slug:${oldSlug}`),
        this.cacheService.del(`events:slug:${savedEvent.slug}`),
        this.cacheService.delByPattern('events:list:*'),
      ]);

      return EventMapper.toResponse(savedEvent);
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const dbError = error as DatabaseError;

      if (dbError.code === '23505' || dbError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'Conflito de dados no evento (slug já existente).',
        );
      }

      this.logger.error(
        `Erro ao atualizar evento ID=${id}`,
        dbError.stack ?? 'Sem stack trace',
      );

      throw new InternalServerErrorException(
        'Erro interno ao atualizar o evento.',
      );
    }
  }
}
