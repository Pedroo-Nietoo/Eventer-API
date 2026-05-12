import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { CreateEventUseCase } from '@events/use-cases/create-event.usecase';
import { FindNearbyEventsUseCase } from '@events/use-cases/find-nearby-events.usecase';
import { ListEventsUseCase } from '@events/use-cases/list-events.usecase';
import { FindEventUseCase } from '@events/use-cases/find-event.usecase';
import { FindEventBySlugUseCase } from '@events/use-cases/find-event-by-slug.usecase';
import { UpdateEventUseCase } from '@events/use-cases/update-event.usecase';
import { DeleteEventUseCase } from '@events/use-cases/delete-event.usecase';
import { ListOrganizerEventsUseCase } from '@events/use-cases/list-organizer-events.usecase';
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
  let listOrganizerEventsUseCase: ListOrganizerEventsUseCase;

  const mockCreateEventUseCase = { execute: jest.fn() };
  const mockFindNearbyEventsUseCase = { execute: jest.fn() };
  const mockListEventsUseCase = { execute: jest.fn() };
  const mockFindEventUseCase = { execute: jest.fn() };
  const mockFindEventBySlugUseCase = { execute: jest.fn() };
  const mockUpdateEventUseCase = { execute: jest.fn() };
  const mockDeleteEventUseCase = { execute: jest.fn() };
  const mockListOrganizerEventsUseCase = { execute: jest.fn() };

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
        { provide: ListOrganizerEventsUseCase, useValue: mockListOrganizerEventsUseCase },
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
    listOrganizerEventsUseCase = module.get<ListOrganizerEventsUseCase>(ListOrganizerEventsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar o CreateEventUseCase.execute', async () => {
      const dto: any = { title: 'Event' };
      const userId = 'user-1';
      mockCreateEventUseCase.execute.mockResolvedValue({ id: '1' });
      const result = await controller.create(dto, userId);
      expect(createEventUseCase.execute).toHaveBeenCalledWith(dto, userId);
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('getNearby', () => {
    it('deve chamar o FindNearbyEventsUseCase.execute', async () => {
      mockFindNearbyEventsUseCase.execute.mockResolvedValue([]);
      const result = await controller.getNearby('-23', '-46', '10');
      expect(findNearbyEventsUseCase.execute).toHaveBeenCalledWith(-23, -46, 10);
      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('deve chamar o ListEventsUseCase.execute', async () => {
      const paginationDto: any = { page: 1 };
      mockListEventsUseCase.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll(paginationDto);
      expect(listEventsUseCase.execute).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findByOrganizer', () => {
    it('deve chamar o ListOrganizerEventsUseCase.execute', async () => {
      const id = 'org-1';
      const pagination: any = { page: 1 };
      mockListOrganizerEventsUseCase.execute.mockResolvedValue({ data: [] });
      const result = await controller.findByOrganizer(id, pagination);
      expect(listOrganizerEventsUseCase.execute).toHaveBeenCalledWith(id, pagination);
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('deve chamar o FindEventUseCase.execute', async () => {
      const id = 'uuid';
      mockFindEventUseCase.execute.mockResolvedValue({ id });
      const result = await controller.findOne(id);
      expect(findEventUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id });
    });
  });

  describe('findBySlug', () => {
    it('deve chamar o FindEventBySlugUseCase.execute', async () => {
      const slug = 'slug';
      mockFindEventBySlugUseCase.execute.mockResolvedValue({ slug });
      const result = await controller.findBySlug(slug);
      expect(findEventBySlugUseCase.execute).toHaveBeenCalledWith(slug);
      expect(result).toEqual({ slug });
    });
  });

  describe('update', () => {
    it('deve chamar o UpdateEventUseCase.execute', async () => {
      const id = 'id';
      const dto: any = {};
      const user: any = { id: 'u1', role: UserRole.ADMIN };
      mockUpdateEventUseCase.execute.mockResolvedValue({ id });
      const result = await controller.update(id, dto, user);
      expect(updateEventUseCase.execute).toHaveBeenCalledWith(id, dto, user.id, user.role);
      expect(result).toEqual({ id });
    });
  });

  describe('remove', () => {
    it('deve chamar o DeleteEventUseCase.execute', async () => {
      const id = 'id';
      const user: any = { id: 'u1', role: UserRole.ADMIN };
      mockDeleteEventUseCase.execute.mockResolvedValue(undefined);
      await controller.remove(id, user);
      expect(deleteEventUseCase.execute).toHaveBeenCalledWith(id, user.id, user.role);
    });
  });
});