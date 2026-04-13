import { Test, TestingModule } from '@nestjs/testing';
import { TicketTypesController } from './ticket-types.controller';
import { CreateTicketTypeUseCase } from '@ticket-types/use-cases/create-ticket-type.usecase';
import { DeleteTicketTypeUseCase } from '@ticket-types/use-cases/delete-ticket-type.usecase';
import { FindTicketTypeUseCase } from '@ticket-types/use-cases/find-ticket-type.usecase';
import { ListTicketTypesUseCase } from '@ticket-types/use-cases/list-ticket-types.usecase';
import { UpdateTicketTypeUseCase } from '@ticket-types/use-cases/update-ticket-type.usecase';

describe('TicketTypesController', () => {
  let controller: TicketTypesController;
  let createTicketTypeUseCase: CreateTicketTypeUseCase;
  let listTicketTypesUseCase: ListTicketTypesUseCase;
  let findTicketTypeUseCase: FindTicketTypeUseCase;
  let updateTicketTypeUseCase: UpdateTicketTypeUseCase;
  let deleteTicketTypeUseCase: DeleteTicketTypeUseCase;

  const mockCreateTicketTypeUseCase = { execute: jest.fn() };
  const mockListTicketTypesUseCase = { execute: jest.fn() };
  const mockFindTicketTypeUseCase = { execute: jest.fn() };
  const mockUpdateTicketTypeUseCase = { execute: jest.fn() };
  const mockDeleteTicketTypeUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketTypesController],
      providers: [
        { provide: CreateTicketTypeUseCase, useValue: mockCreateTicketTypeUseCase },
        { provide: ListTicketTypesUseCase, useValue: mockListTicketTypesUseCase },
        { provide: FindTicketTypeUseCase, useValue: mockFindTicketTypeUseCase },
        { provide: UpdateTicketTypeUseCase, useValue: mockUpdateTicketTypeUseCase },
        { provide: DeleteTicketTypeUseCase, useValue: mockDeleteTicketTypeUseCase },
      ],
    }).compile();

    controller = module.get<TicketTypesController>(TicketTypesController);
    createTicketTypeUseCase = module.get<CreateTicketTypeUseCase>(CreateTicketTypeUseCase);
    listTicketTypesUseCase = module.get<ListTicketTypesUseCase>(ListTicketTypesUseCase);
    findTicketTypeUseCase = module.get<FindTicketTypeUseCase>(FindTicketTypeUseCase);
    updateTicketTypeUseCase = module.get<UpdateTicketTypeUseCase>(UpdateTicketTypeUseCase);
    deleteTicketTypeUseCase = module.get<DeleteTicketTypeUseCase>(DeleteTicketTypeUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar CreateTicketTypeUseCase.execute com o DTO', async () => {
      const dto: any = { name: 'VIP', totalQuantity: 100, price: 250, eventId: 'event-uuid' };
      const expectedResult: any = { id: 'type-uuid', name: 'VIP' };

      mockCreateTicketTypeUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(createTicketTypeUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('deve chamar ListTicketTypesUseCase.execute com a paginação', async () => {
      const paginationDto: any = { page: 1, limit: 15 };
      const expectedResult: any = { data: [], meta: { totalItems: 0 } };

      mockListTicketTypesUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(listTicketTypesUseCase.execute).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('deve chamar FindTicketTypeUseCase.execute com o ID', async () => {
      const id = 'type-uuid-123';
      const expectedResult: any = { id, name: 'Pista' };

      mockFindTicketTypeUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(findTicketTypeUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('deve chamar UpdateTicketTypeUseCase.execute com o ID e o DTO', async () => {
      const id = 'type-uuid-123';
      const dto: any = { price: 300 };
      const expectedResult: any = { id, price: 300 };

      mockUpdateTicketTypeUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.update(id, dto);

      expect(updateTicketTypeUseCase.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('deve chamar DeleteTicketTypeUseCase.execute com o ID', async () => {
      const id = 'type-uuid-123';

      mockDeleteTicketTypeUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(deleteTicketTypeUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toBeUndefined();
    });
  });
});