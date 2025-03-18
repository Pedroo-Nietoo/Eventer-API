import { Module } from '@nestjs/common';
import { TicketTypesService } from './ticket-types.service';
import { EventsService } from '../events.service';
import { TicketTypesController } from './ticket-types.controller';

@Module({
  controllers: [TicketTypesController],
  providers: [TicketTypesService, EventsService],
})
export class TicketTypesModule {}
