import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { CreateTicketUseCase } from '@tickets/use-cases/create-ticket.usecase';
import { DeleteTicketUseCase } from '@tickets/use-cases/delete-ticket.usecase';
import { DispatchTicketEmailUseCase } from '@tickets/use-cases/dispatch-ticket-email.usecase';
import { FindTicketUseCase } from '@tickets/use-cases/find-ticket.usecase';
import { ListTicketsUseCase } from '@tickets/use-cases/list-tickets.usecase';
import { UpdateTicketUseCase } from '@tickets/use-cases/update-ticket.usecase';
import { ValidateTicketUseCase } from '@tickets/use-cases/validate-ticket.usecase';

describe('TicketsController', () => {
  let controller: TicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: CreateTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DispatchTicketEmailUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListTicketsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ValidateTicketUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
