import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { EventsService } from '../events/events.service';
import { QrCodeService } from '@src/common/qr-code/qr-code.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, EventsService, QrCodeService],
})
export class TicketsModule {}
