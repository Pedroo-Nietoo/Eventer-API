import { Test, TestingModule } from '@nestjs/testing';
import { EventTicketTypesService } from './event-ticket-types.service';

describe('EventTicketTypesService', () => {
  let service: EventTicketTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventTicketTypesService],
    }).compile();

    service = module.get<EventTicketTypesService>(EventTicketTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
