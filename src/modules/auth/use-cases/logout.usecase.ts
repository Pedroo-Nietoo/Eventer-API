import { Injectable, Logger } from '@nestjs/common';
import { SessionService } from 'src/infra/redis/session.service';

@Injectable()
export class LogoutUseCase {
 private readonly logger = new Logger(LogoutUseCase.name);

 constructor(
  private readonly sessionService: SessionService,
 ) { }

 async execute(token: string): Promise<void> {
  const deleted = await this.sessionService.deleteSession(token);

  if (deleted) {
   this.logger.log(`Token removido com sucesso: ${token}`);
  } else {
   this.logger.warn(`Token não encontrado ou já expirado: ${token}`);
  }
 }
}