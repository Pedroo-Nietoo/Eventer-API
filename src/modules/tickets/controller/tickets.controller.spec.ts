import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { CreateTicketUseCase } from '@tickets/use-cases/create-ticket.usecase';
import { ValidateTicketUseCase } from '@tickets/use-cases/validate-ticket.usecase';
import { ListTicketsUseCase } from '@tickets/use-cases/list-tickets.usecase';
import { FindTicketUseCase } from '@tickets/use-cases/find-ticket.usecase';
import { UpdateTicketUseCase } from '@tickets/use-cases/update-ticket.usecase';
import { DeleteTicketUseCase } from '@tickets/use-cases/delete-ticket.usecase';

describe('TicketsController', () => {
  let controller: TicketsController;
  let createTicketUseCase: CreateTicketUseCase;
  let validateTicketUseCase: ValidateTicketUseCase;
  let listTicketsUseCase: ListTicketsUseCase;
  let findTicketUseCase: FindTicketUseCase;
  let updateTicketUseCase: UpdateTicketUseCase;
  let deleteTicketUseCase: DeleteTicketUseCase;

  const mockCreateTicketUseCase = { execute: jest.fn() };
  const mockValidateTicketUseCase = { execute: jest.fn() };
  const mockListTicketsUseCase = { execute: jest.fn() };
  const mockFindTicketUseCase = { execute: jest.fn() };
  const mockUpdateTicketUseCase = { execute: jest.fn() };
  const mockDeleteTicketUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        { provide: CreateTicketUseCase, useValue: mockCreateTicketUseCase },
        { provide: ValidateTicketUseCase, useValue: mockValidateTicketUseCase },
        { provide: ListTicketsUseCase, useValue: mockListTicketsUseCase },
        { provide: FindTicketUseCase, useValue: mockFindTicketUseCase },
        { provide: UpdateTicketUseCase, useValue: mockUpdateTicketUseCase },
        { provide: DeleteTicketUseCase, useValue: mockDeleteTicketUseCase },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    createTicketUseCase = module.get<CreateTicketUseCase>(CreateTicketUseCase);
    validateTicketUseCase = module.get<ValidateTicketUseCase>(ValidateTicketUseCase);
    listTicketsUseCase = module.get<ListTicketsUseCase>(ListTicketsUseCase);
    findTicketUseCase = module.get<FindTicketUseCase>(FindTicketUseCase);
    updateTicketUseCase = module.get<UpdateTicketUseCase>(UpdateTicketUseCase);
    deleteTicketUseCase = module.get<DeleteTicketUseCase>(DeleteTicketUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar CreateTicketUseCase.execute com o DTO e o loggedUserId', async () => {
      const dto: any = { ticketTypeId: 'type-uuid', eventId: 'event-uuid' };
      const loggedUserId = 'user-uuid-123';
      const expectedResult: any = { id: 'ticket-uuid', status: 'VALID' };

      mockCreateTicketUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.create(dto, loggedUserId);

      expect(createTicketUseCase.execute).toHaveBeenCalledWith(dto, loggedUserId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('validate', () => {
    it('deve extrair o qrCode do DTO e chamar ValidateTicketUseCase.execute', async () => {
      const dto: any = { qrCode: 'token-secreto-123' };
      const expectedResult: any = { success: true, message: 'Ingresso validado com sucesso!' };

      mockValidateTicketUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.validate(dto);

      expect(validateTicketUseCase.execute).toHaveBeenCalledWith(dto.qrCode);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('deve chamar ListTicketsUseCase.execute com a paginação', async () => {
      const paginationDto: any = { page: 1, limit: 10 };
      const expectedResult: any = { data: [], meta: { totalItems: 0 } };

      mockListTicketsUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(listTicketsUseCase.execute).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('deve chamar FindTicketUseCase.execute com o ID correto', async () => {
      const id = 'ticket-uuid-123';
      const expectedResult: any = { id, status: 'VALID' };

      mockFindTicketUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(findTicketUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('deve chamar UpdateTicketUseCase.execute com o ID, DTO e userId corretos', async () => {
      const id = 'ticket-uuid-123';
      const dto: any = { status: 'CANCELLED' };
      const userId = 'user-uuid-123';
      const expectedResult: any = { id, status: 'CANCELLED' };

      mockUpdateTicketUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.update(id, dto, userId);

      expect(updateTicketUseCase.execute).toHaveBeenCalledWith(id, dto, userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('deve chamar DeleteTicketUseCase.execute com o ID correto', async () => {
      const id = 'ticket-uuid-123';

      mockDeleteTicketUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(deleteTicketUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toBeUndefined();
    });
  });
});