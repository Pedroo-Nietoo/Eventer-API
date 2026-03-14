import { Test, TestingModule } from '@nestjs/testing';
import { TicketTypeController } from './ticket-types.controller';
import { TicketTypeService } from '../ticket-type.service';

describe('TicketTypeController', () => {
  let controller: TicketTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketTypeController],
      providers: [TicketTypeService],
    }).compile();

    controller = module.get<TicketTypeController>(TicketTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
