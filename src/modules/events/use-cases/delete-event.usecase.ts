import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@common/enums/role.enum';
import { EventsRepository } from '@events/repository/events.repository';
import { CacheService } from '@infra/redis/services/cache.service';

@Injectable()
export class DeleteEventUseCase {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(id: string, userId: string, userRole: UserRole): Promise<void> {
    const event = await this.eventsRepository.findById(id);

    if (!event) {
      throw new NotFoundException(`Evento com ID ${id} não encontrado.`);
    }

    if (event.organizerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir este evento.',
      );
    }

    await this.eventsRepository.softDelete(id);

    await Promise.all([
      this.cacheService.del(`events:id:${id}`),
      this.cacheService.del(`events:slug:${event.slug}`),
      this.cacheService.delByPattern('events:list:*'),
    ]);
  }
}
