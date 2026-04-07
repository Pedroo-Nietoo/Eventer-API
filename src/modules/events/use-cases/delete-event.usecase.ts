import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@common/enums/role.enum';
import { EventsRepository } from '@events/repository/events.repository';

@Injectable()
export class DeleteEventUseCase {
 constructor(private readonly eventsRepository: EventsRepository) { }

 async execute(id: string, userId: string, userRole: UserRole): Promise<void> {
  const event = await this.eventsRepository.findById(id);

  if (!event) {
   throw new NotFoundException(`Evento com ID ${id} não encontrado.`);
  }

  if (event.organizerId !== userId && userRole !== UserRole.ADMIN) {
   throw new ForbiddenException('Você não tem permissão para excluir este evento.');
  }

  await this.eventsRepository.softDelete(id);
 }
}