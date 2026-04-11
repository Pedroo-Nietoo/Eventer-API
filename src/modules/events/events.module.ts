import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { CreateEventUseCase } from './use-cases/create-event.usecase';
import { FindNearbyEventsUseCase } from './use-cases/find-nearby-events.usecase';
import { ListEventsUseCase } from './use-cases/list-events.usecase';
import { FindEventUseCase } from './use-cases/find-event.usecase';
import { UpdateEventUseCase } from './use-cases/update-event.usecase';
import { DeleteEventUseCase } from './use-cases/delete-event.usecase';
import { EventsController } from './controller/events.controller';
import { FindEventBySlugUseCase } from './use-cases/find-event-by-slug.usecase';
import { EventsRepository } from './repository/events.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [EventsController],
  providers: [
    EventsRepository,
    CreateEventUseCase,
    FindNearbyEventsUseCase,
    ListEventsUseCase,
    FindEventUseCase,
    FindEventBySlugUseCase,
    UpdateEventUseCase,
    DeleteEventUseCase,
  ],
  exports: [EventsRepository, FindEventUseCase],
})
export class EventsModule {}
