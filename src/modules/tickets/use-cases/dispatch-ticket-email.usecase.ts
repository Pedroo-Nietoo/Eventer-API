import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { GenerateQrCodeImageService } from 'src/services/generate-qrcode-image.service';
import { MailService } from 'src/services/mail/mail.service';

@Injectable()
export class DispatchTicketEmailUseCase {
 private readonly logger = new Logger(DispatchTicketEmailUseCase.name);

 constructor(
  private readonly dataSource: DataSource,
  private readonly generateQrCodeImageService: GenerateQrCodeImageService,
  private readonly mailService: MailService,
 ) { }

 async execute(ticketId: string, qrCodeToken: string): Promise<void> {
  try {
   const ticket = await this.dataSource.getRepository(Ticket).findOne({
    where: { id: ticketId },
    relations: {
     user: true,
     ticketType: { event: true }
    },
   });

   if (!ticket) {
    this.logger.warn(`Tentativa de enviar e-mail para ticket inexistente: ${ticketId}`);
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