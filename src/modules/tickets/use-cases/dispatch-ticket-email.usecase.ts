import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DispatchTicketEmailUseCase {
  private readonly logger = new Logger(DispatchTicketEmailUseCase.name);

  constructor(@InjectQueue('mail-queue') private readonly mailQueue: Queue) {}

  async execute(ticketId: string, qrCodeToken: string): Promise<void> {
    try {
      await this.mailQueue.add(
        'send-ticket-email',
        { ticketId, qrCodeToken },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
          },
          // removeOnComplete: true,
        },
      );

      this.logger.log(
        `Job de e-mail enfileirado com sucesso para o ticket: ${ticketId}`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao enfileirar e-mail';
      this.logger.error(
        `Falha ao colocar o e-mail do ticket ${ticketId} na fila: ${message}`,
      );
    }
  }
}
