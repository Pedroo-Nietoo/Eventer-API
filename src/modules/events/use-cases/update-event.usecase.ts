import { Injectable, NotFoundException, InternalServerErrorException, Logger, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventsRepository } from '../repository/events.repository';
import { EventMapper } from '../mappers/event.mapper';
import { EventResponseDto } from '../dto/event-response.dto';
import generateSlug from 'src/common/utils/generate-slug';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class UpdateEventUseCase {
 private readonly logger = new Logger(UpdateEventUseCase.name);

 constructor(private readonly eventsRepository: EventsRepository) { }

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
    throw new ForbiddenException('Você não tem permissão para editar este evento.');
   }

   if (!dto || Object.keys(dto).length === 0) {
    return EventMapper.toResponse(event);
   }

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

   return EventMapper.toResponse(savedEvent);
  } catch (error) {
   if (
    error instanceof NotFoundException ||
    error instanceof ForbiddenException ||
    error instanceof BadRequestException
   ) {
    throw error;
   }

   if (error?.code === '23505' || error?.code === 'ER_DUP_ENTRY') {
    throw new ConflictException('Conflito de dados no evento (slug já existente).');
   }

   this.logger.error(`Erro ao atualizar evento ID=${id}`, error.stack);

   throw new InternalServerErrorException('Erro interno ao atualizar o evento.');
  }
 }
}