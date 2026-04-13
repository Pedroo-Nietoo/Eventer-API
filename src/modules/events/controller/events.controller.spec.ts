import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { CreateEventUseCase } from '@events/use-cases/create-event.usecase';
import { FindNearbyEventsUseCase } from '@events/use-cases/find-nearby-events.usecase';
import { ListEventsUseCase } from '@events/use-cases/list-events.usecase';
import { FindEventUseCase } from '@events/use-cases/find-event.usecase';
import { FindEventBySlugUseCase } from '@events/use-cases/find-event-by-slug.usecase';
import { UpdateEventUseCase } from '@events/use-cases/update-event.usecase';
import { DeleteEventUseCase } from '@events/use-cases/delete-event.usecase';
import { UserRole } from '@common/enums/role.enum';

describe('EventsController', () => {
  let controller: EventsController;
  let createEventUseCase: CreateEventUseCase;
  let findNearbyEventsUseCase: FindNearbyEventsUseCase;
  let listEventsUseCase: ListEventsUseCase;
  let findEventUseCase: FindEventUseCase;
  let findEventBySlugUseCase: FindEventBySlugUseCase;
  let updateEventUseCase: UpdateEventUseCase;
  let deleteEventUseCase: DeleteEventUseCase;

  const mockCreateEventUseCase = { execute: jest.fn() };
  const mockFindNearbyEventsUseCase = { execute: jest.fn() };
  const mockListEventsUseCase = { execute: jest.fn() };
  const mockFindEventUseCase = { execute: jest.fn() };
  const mockFindEventBySlugUseCase = { execute: jest.fn() };
  const mockUpdateEventUseCase = { execute: jest.fn() };
  const mockDeleteEventUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: CreateEventUseCase, useValue: mockCreateEventUseCase },
        { provide: FindNearbyEventsUseCase, useValue: mockFindNearbyEventsUseCase },
        { provide: ListEventsUseCase, useValue: mockListEventsUseCase },
        { provide: FindEventUseCase, useValue: mockFindEventUseCase },
        { provide: FindEventBySlugUseCase, useValue: mockFindEventBySlugUseCase },
        { provide: UpdateEventUseCase, useValue: mockUpdateEventUseCase },
        { provide: DeleteEventUseCase, useValue: mockDeleteEventUseCase },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    createEventUseCase = module.get<CreateEventUseCase>(CreateEventUseCase);
    findNearbyEventsUseCase = module.get<FindNearbyEventsUseCase>(FindNearbyEventsUseCase);
    listEventsUseCase = module.get<ListEventsUseCase>(ListEventsUseCase);
    findEventUseCase = module.get<FindEventUseCase>(FindEventUseCase);
    findEventBySlugUseCase = module.get<FindEventBySlugUseCase>(FindEventBySlugUseCase);
    updateEventUseCase = module.get<UpdateEventUseCase>(UpdateEventUseCase);
    deleteEventUseCase = module.get<DeleteEventUseCase>(DeleteEventUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar CreateEventUseCase.execute com o DTO e o userId', async () => {
      const dto: any = { title: 'Novo Evento', latitude: -23.5, longitude: -46.6 };
      const userId = 'user-uuid-123';
      const expectedResult: any = { id: 'evt-uuid', title: 'Novo Evento' };

      mockCreateEventUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.create(dto, userId);

      expect(createEventUseCase.execute).toHaveBeenCalledWith(dto, userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getNearby', () => {
    it('deve converter as queries para number e chamar FindNearbyEventsUseCase.execute', async () => {
      const lat = '-23.5614';
      const lng = '-46.6562';
      const radius = '15';
      const expectedResult: any = [{ id: 'evt-uuid', title: 'Evento Próximo' }];

      mockFindNearbyEventsUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.getNearby(lat, lng, radius);

      expect(findNearbyEventsUseCase.execute).toHaveBeenCalledWith(
        -23.5614,
        -46.6562,
        15,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('deve chamar ListEventsUseCase.execute com a paginação', async () => {
      const paginationDto: any = { page: 2, limit: 10 };
      const expectedResult: any = { data: [], meta: { currentPage: 2 } };

      mockListEventsUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(listEventsUseCase.execute).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('deve chamar FindEventUseCase.execute com o ID do evento', async () => {
      const id = 'evt-uuid-123';
      const expectedResult: any = { id, title: 'Meu Evento' };

      mockFindEventUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(findEventUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findBySlug', () => {
    it('deve chamar FindEventBySlugUseCase.execute com o slug', async () => {
      const slug = 'meu-evento-tecnologia';
      const expectedResult: any = { id: 'evt-uuid', slug };

      mockFindEventBySlugUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findBySlug(slug);

      expect(findEventBySlugUseCase.execute).toHaveBeenCalledWith(slug);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('deve desestruturar o user e chamar UpdateEventUseCase.execute', async () => {
      const id = 'evt-uuid-123';
      const dto: any = { title: 'Evento Atualizado' };
      const user: any = { id: 'user-uuid', role: UserRole.EVENT_CREATOR };
      const expectedResult: any = { id, title: 'Evento Atualizado' };

      mockUpdateEventUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.update(id, dto, user);

      expect(updateEventUseCase.execute).toHaveBeenCalledWith(
        id,
        dto,
        user.id,
        user.role,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('deve desestruturar o user e chamar DeleteEventUseCase.execute', async () => {
      const id = 'evt-uuid-123';
      const user: any = { id: 'admin-uuid', role: UserRole.ADMIN };

      mockDeleteEventUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.remove(id, user);

      expect(deleteEventUseCase.execute).toHaveBeenCalledWith(
        id,
        user.id,
        user.role,
      );
      expect(result).toBeUndefined();
    });
  });
});