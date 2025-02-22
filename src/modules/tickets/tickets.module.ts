import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { EventsService } from '../events/events.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService, EventsService],
})
export class TicketsModule {}
