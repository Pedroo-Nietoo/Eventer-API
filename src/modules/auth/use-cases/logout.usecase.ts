import { SessionService } from '@infra/redis/services/session.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(private readonly sessionService: SessionService) {}

  async execute(userId: string): Promise<void> {
    await this.sessionService.invalidatePreviousSession(userId);
    this.logger.log(
      `Sessão e índices removidos com sucesso para o usuário: ${userId}`,
    );
  }
}
