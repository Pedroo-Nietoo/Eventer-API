import { Module } from '@nestjs/common';
import { TicketTypesService } from './ticket-types.service';
import { TicketTypesController } from './ticket-types.controller';
import { EventsService } from '@src/modules/events/events.service';

@Module({
  controllers: [TicketTypesController],
  providers: [TicketTypesService, EventsService],
})
export class TicketTypesModule {}
