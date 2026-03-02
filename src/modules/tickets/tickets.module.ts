import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TicketsService } from './services/tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { GenerateTicketTokenService } from './services/generate-ticket-token.service';
import { GenerateQrCodeImageService } from './services/generate-qrcode-image.service';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    ConfigModule,
  ],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    GenerateTicketTokenService,
    GenerateQrCodeImageService,
    MailService,
  ],
})
export class TicketsModule { }