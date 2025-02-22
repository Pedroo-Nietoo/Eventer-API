import { Module } from '@nestjs/common';
import { EventTicketTypesService } from './event-ticket-types.service';
import { EventTicketTypesController } from './event-ticket-types.controller';
import { EventsService } from '../events.service';

@Module({
  controllers: [EventTicketTypesController],
  providers: [EventTicketTypesService, EventsService],
})
export class EventTicketTypesModule {}
