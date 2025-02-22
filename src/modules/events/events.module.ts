import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventTicketTypesModule } from './event-ticket-types/event-ticket-types.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [EventTicketTypesModule],
})
export class EventsModule {}
