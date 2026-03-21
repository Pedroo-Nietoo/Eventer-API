import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '../entities/ticket.entity';
import { TicketsRepository } from '../repository/ticket.repository';
import { ValidateTicketResponseDto } from '../dto/validate-ticket-response.dto';

@Injectable()
export class ValidateTicketUseCase {
 constructor(
  private readonly ticketsRepository: TicketsRepository,
 ) { }

 async execute(qrCodeString: string): Promise<ValidateTicketResponseDto> {
  const ticket = await this.ticketsRepository.findByQrCodeWithRelations(qrCodeString);

  if (!ticket) {
   throw new NotFoundException('Ingresso não encontrado ou QR Code inválido.');
  }

  if (ticket.status === TicketStatus.USED) throw new BadRequestException('Este ingresso já foi utilizado.');
  if (ticket.status === TicketStatus.CANCELLED) throw new BadRequestException('Este ingresso está cancelado.');

  const event = ticket.ticketType?.event;

  if (!event || !this.validateDate(event.eventDate.toString())) {
   throw new BadRequestException('Este ingresso ainda não pode ser validado. O evento ocorrerá em breve.');
  }

  ticket.status = TicketStatus.USED;
  await this.ticketsRepository.save(ticket);

  return {
   success: true,
   message: 'Ingresso validado com sucesso!',
   ticketData: {
    id: ticket.id,
    ticketTypeName: ticket.ticketType?.name,
   },
  };
 }

 private validateDate(eventDate: string): boolean {
  const now = new Date();
  const event = new Date(eventDate);
  return now.getTime() >= event.getTime();
 }
}