import { Test, TestingModule } from '@nestjs/testing';
import { TicketTypesController } from './ticket-types.controller';
import { CreateTicketTypeUseCase } from '@ticket-types/use-cases/create-ticket-type.usecase';
import { DeleteTicketTypeUseCase } from '@ticket-types/use-cases/delete-ticket-type.usecase';
import { FindTicketTypeUseCase } from '@ticket-types/use-cases/find-ticket-type.usecase';
import { ListTicketTypesUseCase } from '@ticket-types/use-cases/list-ticket-types.usecase';
import { UpdateTicketTypeUseCase } from '@ticket-types/use-cases/update-ticket-type.usecase';

describe('TicketTypeController', () => {
  let controller: TicketTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketTypesController],
      providers: [
        {
          provide: CreateTicketTypeUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteTicketTypeUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindTicketTypeUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListTicketTypesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateTicketTypeUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<TicketTypesController>(TicketTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
