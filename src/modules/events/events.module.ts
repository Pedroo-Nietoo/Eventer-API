import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TicketTypesModule } from './ticket-types/ticket-types.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [TicketTypesModule],
})
export class EventsModule {}
