import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindTicketTypeUseCase } from './find-ticket-type.usecase';
import { TicketTypeResponseDto } from '../dto/ticket-type-response.dto';
import { UpdateTicketTypeDto } from '../dto/update-ticket-type.dto';
import { TicketTypesRepository } from '../repository/ticket-type.repository';

@Injectable()
export class UpdateTicketTypeUseCase {
 constructor(
  private readonly ticketTypesRepository: TicketTypesRepository,
  private readonly findTicketTypeUseCase: FindTicketTypeUseCase,
 ) { }

 async execute(id: string, dto: UpdateTicketTypeDto): Promise<TicketTypeResponseDto> {
  const ticketType = await this.ticketTypesRepository.findById(id);

  if (!ticketType) {
   throw new NotFoundException('Tipo de ingresso não encontrado para atualização.');
  }

  if (dto.totalQuantity !== undefined && dto.totalQuantity !== ticketType.totalQuantity) {
   const ticketsSold = ticketType.totalQuantity - ticketType.availableQuantity;

   if (dto.totalQuantity < ticketsSold) {
    throw new BadRequestException(
     `A nova quantidade total não pode ser menor do que o número de ingressos já vendidos (${ticketsSold}).`
    );
   }

   const difference = dto.totalQuantity - ticketType.totalQuantity;
   ticketType.availableQuantity += difference;
  }

  Object.assign(ticketType, dto);

  await this.ticketTypesRepository.save(ticketType);

  return this.findTicketTypeUseCase.execute(id);
 }
}