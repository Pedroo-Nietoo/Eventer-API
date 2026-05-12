import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TicketsRepository } from '@tickets/repository/ticket.repository';
import { MailService } from '@services/mail/mail.service';
import { GenerateQrCodeImageService } from '@services/generate-qrcode-image.service';

interface SendTicketEmailJob {
  ticketId: string;
  qrCodeToken: string;
}

@Processor('mail-queue')
export class TicketEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(TicketEmailProcessor.name);

  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly generateQrCodeImageService: GenerateQrCodeImageService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async process(job: Job<SendTicketEmailJob>): Promise<void> {
    const { ticketId, qrCodeToken } = job.data;

    this.logger.log(
      `Iniciando processamento do e-mail para o ticket ${ticketId}...`,
    );

    const ticket = await this.ticketsRepository.findByIdWithRelations(ticketId);

    if (!ticket || !ticket.user?.email) {
      this.logger.warn(
        `Tentativa de enviar e-mail para ticket inexistente ou sem e-mail: ${ticketId}`,
      );
      return;
    }

    try {
      const qrCodeBuffer =
        await this.generateQrCodeImageService.execute(qrCodeToken);

      await this.mailService.sendTicketEmail(
        ticket.user.email,
        ticket.user.username,
        ticket.ticketType.event.title,
        ticket.ticketType.name,
        qrCodeBuffer,
      );

      this.logger.log(
        `E-mail de confirmação enviado com sucesso para: ${ticket.user.email}`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao disparar e-mail';
      this.logger.error(
        `Falha no worker ao disparar e-mail do ticket ${ticketId}: ${message}`,
      );
      throw error;
    }
  }
}
