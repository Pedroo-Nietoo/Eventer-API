import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '../entities/ticket.entity';
import { TicketsRepository } from '../repository/ticket.repository';
import { ValidateTicketResponseDto } from '../dto/validate-ticket-response.dto';
import { FindEventUseCase } from 'src/modules/events/use-cases/find-event.usecase';

@Injectable()
export class ValidateTicketUseCase {
 private readonly secretKey: string;

 constructor(
  private readonly ticketsRepository: TicketsRepository,
  private readonly configService: ConfigService,
  private findEventUseCase: FindEventUseCase,
 ) {
  this.secretKey = this.configService.get<string>('JWT_SECRET') || "chave-secreta-padrao-para-desenvolvimento";
 }

 async execute(qrCode: string): Promise<ValidateTicketResponseDto> {
  try {
   const payload = jwt.verify(qrCode, this.secretKey) as jwt.JwtPayload;
   const ticketId = payload.sub as string;
   const eventId = payload.eventId as string;

   if (!ticketId || !eventId) {
    throw new BadRequestException('QR Code inválido, corrompido ou adulterado.');
   }

   const event = await this.findEventUseCase.execute(eventId);

   if (!this.validateDate(event.eventDate.toString())) {
    throw new BadRequestException('Este ingresso ainda não pode ser validado. O evento ocorrerá em breve.');
   }

   const ticket = await this.ticketsRepository.findByIdWithRelations(ticketId);

   if (!ticket) throw new NotFoundException('Ingresso não encontrado na base de dados.');
   if (ticket.status === TicketStatus.USED) throw new BadRequestException('Este ingresso já foi utilizado.');
   if (ticket.status === TicketStatus.CANCELLED) throw new BadRequestException('Este ingresso está cancelado.');

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
  } catch (error) {
   if (error instanceof jwt.JsonWebTokenError) {
    throw new BadRequestException('QR Code inválido, corrompido ou adulterado.');
   }
   throw error;
  }
 }

 private validateDate(eventDate: string): boolean {
  const now = new Date();
  const event = new Date(eventDate);
  return now.getTime() >= event.getTime();
 }
}