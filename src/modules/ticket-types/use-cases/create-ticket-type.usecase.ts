import {
 Injectable,
 InternalServerErrorException,
 Logger,
 NotFoundException,
} from '@nestjs/common';
import { TicketTypeMapper } from '../mappers/ticket-type.mapper';
import { TicketTypeResponseDto } from '../dto/ticket-type-response.dto';
import { CreateTicketTypeDto } from '../dto/create-ticket-type.dto';
import { TicketTypesRepository } from '../repository/ticket-type.repository';

@Injectable()
export class CreateTicketTypeUseCase {
 private readonly logger = new Logger(CreateTicketTypeUseCase.name);

 constructor(private readonly ticketTypesRepository: TicketTypesRepository) { }

 async execute(dto: CreateTicketTypeDto): Promise<TicketTypeResponseDto> {
  const ticketType = this.ticketTypesRepository.create({
   ...dto,
   availableQuantity: dto.totalQuantity,
   event: { id: dto.eventId },
  });

  try {
   const saved = await this.ticketTypesRepository.save(ticketType);
   return TicketTypeMapper.toResponse(saved);
  } catch (error) {
   if (error.code === '23503') {
    throw new NotFoundException('O evento informado não existe na base de dados.');
   }

   this.logger.error(`Erro ao criar tipo de ingresso: ${error.message}`, error.stack);
   throw new InternalServerErrorException('Ocorreu um erro interno ao criar o lote de ingressos.');
  }
 }
}