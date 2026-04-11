import { Injectable, Logger } from '@nestjs/common';
import { TicketsRepository } from '@tickets/repository/ticket.repository';
import { MailService } from '@services/mail/mail.service';
import { GenerateQrCodeImageService } from '@services/generate-qrcode-image.service';

@Injectable()
export class DispatchTicketEmailUseCase {
  private readonly logger = new Logger(DispatchTicketEmailUseCase.name);

  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly generateQrCodeImageService: GenerateQrCodeImageService,
    private readonly mailService: MailService,
  ) {}

  async execute(ticketId: string, qrCodeToken: string): Promise<void> {
    try {
      const ticket =
        await this.ticketsRepository.findByIdWithRelations(ticketId);

      if (!ticket || !ticket.user?.email) {
        this.logger.warn(
          `Tentativa de enviar e-mail para ticket inexistente ou sem e-mail: ${ticketId}`,
        );
        return;
      }

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
        `E-mail de confirmação enviado para: ${ticket.user.email}`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao disparar e-mail';
      this.logger.error(
        `Falha ao disparar e-mail do ticket ${ticketId}: ${message}`,
      );
    }
  }
}
