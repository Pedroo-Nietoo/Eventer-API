import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { GenerateQrCodeImageService } from '../../../core/services/generate-qrcode-image.service';
import { MailService } from 'src/core/services/mail/mail.service';

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
   const ticketFull = await this.dataSource.getRepository(Ticket).findOne({
    where: { id: ticketId },
    relations: {
     user: true,
     ticketType: { event: true }
    },
   });

   if (!ticketFull) {
    this.logger.warn(`Tentativa de enviar e-mail para ticket inexistente: ${ticketId}`);
    return;
   }

   const qrCodeBuffer = await this.generateQrCodeImageService.execute(qrCodeToken);

   await this.mailService.sendTicketEmail(
    ticketFull.user.email,
    ticketFull.user.username,
    ticketFull.ticketType.event.title,
    ticketFull.ticketType.name,
    qrCodeBuffer,
   );

   this.logger.log(`E-mail de confirmação enviado para: ${ticketFull.user.email}`);
  } catch (error) {
   this.logger.error(`Falha ao disparar e-mail do ticket ${ticketId}: ${error.message}`);
  }
 }
}