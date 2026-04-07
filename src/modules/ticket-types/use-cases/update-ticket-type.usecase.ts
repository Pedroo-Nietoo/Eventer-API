import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindTicketTypeUseCase } from './find-ticket-type.usecase';
import { TicketTypeResponseDto } from '@ticket-types/dto/ticket-type-response.dto';
import { UpdateTicketTypeDto } from '@ticket-types/dto/update-ticket-type.dto';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { TicketTypeMapper } from '@ticket-types/mappers/ticket-type.mapper';

@Injectable()
export class UpdateTicketTypeUseCase {
 constructor(
  private readonly ticketTypesRepository: TicketTypesRepository
 ) { }

 async execute(id: string, dto: UpdateTicketTypeDto): Promise<TicketTypeResponseDto> {
  const ticketType = await this.ticketTypesRepository.findById(id);

  if (!ticketType) {
   throw new NotFoundException('Tipo de ingresso não encontrado para atualização.');
  }

  if (
   dto.totalQuantity !== undefined &&
   dto.totalQuantity !== ticketType.totalQuantity
  ) {
   const ticketsSold =
    ticketType.totalQuantity - ticketType.availableQuantity;

   if (dto.totalQuantity < ticketsSold) {
    throw new BadRequestException(
     `A nova quantidade total não pode ser menor do que o número de ingressos já vendidos (${ticketsSold}).`
    );
   }

   const difference = dto.totalQuantity - ticketType.totalQuantity;
   ticketType.availableQuantity += difference;
  }

  const { totalQuantity, ...updateData } = dto;

  if (totalQuantity !== undefined) {
   ticketType.totalQuantity = totalQuantity;
  }

  Object.assign(ticketType, updateData);

  const updatedEntity = await this.ticketTypesRepository.save(ticketType);

  return TicketTypeMapper.toResponse(updatedEntity);
 }
}