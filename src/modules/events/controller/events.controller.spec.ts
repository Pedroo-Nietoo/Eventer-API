import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { CreateEventUseCase } from '@events/use-cases/create-event.usecase';
import { FindEventUseCase } from '@events/use-cases/find-event.usecase';
import { ListEventsUseCase } from '@events/use-cases/list-events.usecase';
import { DeleteEventUseCase } from '@events/use-cases/delete-event.usecase';
import { UpdateEventUseCase } from '@events/use-cases/update-event.usecase';
import { FindEventBySlugUseCase } from '@events/use-cases/find-event-by-slug.usecase';
import { FindNearbyEventsUseCase } from '@events/use-cases/find-nearby-events.usecase';

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: CreateEventUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindEventUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListEventsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteEventUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateEventUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindEventBySlugUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindNearbyEventsUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
