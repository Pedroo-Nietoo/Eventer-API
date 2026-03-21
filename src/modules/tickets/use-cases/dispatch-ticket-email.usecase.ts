import { Injectable, Logger } from '@nestjs/common';
import { TicketsRepository } from '../repository/ticket.repository';
import { MailService } from 'src/services/mail/mail.service';
import { GenerateQrCodeImageService } from 'src/services/generate-qrcode-image.service';

@Injectable()
export class DispatchTicketEmailUseCase {
 private readonly logger = new Logger(DispatchTicketEmailUseCase.name);

 constructor(
  private readonly ticketsRepository: TicketsRepository,
  private readonly generateQrCodeImageService: GenerateQrCodeImageService,
  private readonly mailService: MailService,
 ) { }

 async execute(ticketId: string, qrCodeToken: string): Promise<void> {
  try {
   const ticket = await this.ticketsRepository.findByIdWithRelations(ticketId);

   if (!ticket || !ticket.user?.email) {
    this.logger.warn(`Tentativa de enviar e-mail para ticket inexistente ou sem e-mail: ${ticketId}`);
    return;
   }

   const qrCodeBuffer = await this.generateQrCodeImageService.execute(qrCodeToken);

   await this.mailService.sendTicketEmail(
    ticket.user.email,
    ticket.user.username,
    ticket.ticketType.event.title,
    ticket.ticketType.name,
    qrCodeBuffer,
   );

   this.logger.log(`E-mail de confirmação enviado para: ${ticket.user.email}`);
  } catch (error) {
   this.logger.error(`Falha ao disparar e-mail do ticket ${ticketId}: ${error.message}`);
  }
 }
}