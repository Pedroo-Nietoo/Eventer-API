import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsRepository } from '../repository/events.repository';

@Injectable()
export class DeleteEventUseCase {
 constructor(private readonly eventsRepository: EventsRepository) { }

 async execute(id: string) {
  const result = await this.eventsRepository.softDelete(id);

  if (result.affected === 0) {
   throw new NotFoundException(`Evento com ID ${id} não encontrado.`);
  }

  return {
   message: 'Evento removido com sucesso',
  };
 }
}