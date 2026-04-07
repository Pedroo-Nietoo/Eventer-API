import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Ticket } from './entities/ticket.entity';
import { TicketsController } from './controller/tickets.controller';
import { CreateTicketUseCase } from './use-cases/create-ticket.usecase';
import { ValidateTicketUseCase } from './use-cases/validate-ticket.usecase';
import { ListTicketsUseCase } from './use-cases/list-tickets.usecase';
import { FindTicketUseCase } from './use-cases/find-ticket.usecase';
import { UpdateTicketUseCase } from './use-cases/update-ticket.usecase';
import { DeleteTicketUseCase } from './use-cases/delete-ticket.usecase';
import { TicketsRepository } from './repository/ticket.repository';
import { DispatchTicketEmailUseCase } from './use-cases/dispatch-ticket-email.usecase';
import { EventsModule } from '@events/events.module';
import { GenerateTicketTokenService } from '@services/generate-ticket-token.service';
import { GenerateQrCodeImageService } from '@services/generate-qrcode-image.service';
import { MailService } from '@services/mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    ConfigModule,
    EventsModule
  ],
  controllers: [TicketsController],
  providers: [
    TicketsRepository,
    GenerateTicketTokenService,
    GenerateQrCodeImageService,
    MailService,
    CreateTicketUseCase,
    DispatchTicketEmailUseCase,
    ValidateTicketUseCase,
    ListTicketsUseCase,
    FindTicketUseCase,
    UpdateTicketUseCase,
    DeleteTicketUseCase,
  ],
  exports: [TicketsRepository, CreateTicketUseCase],
})
export class TicketsModule { }