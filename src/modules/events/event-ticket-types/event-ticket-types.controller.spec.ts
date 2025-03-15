import { Test, TestingModule } from '@nestjs/testing';
import { EventTicketTypesController } from './event-ticket-types.controller';
import { EventTicketTypesService } from './event-ticket-types.service';

describe('EventTicketTypesController', () => {
  let controller: EventTicketTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventTicketTypesController],
      providers: [EventTicketTypesService],
    }).compile();

    controller = module.get<EventTicketTypesController>(
      EventTicketTypesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
