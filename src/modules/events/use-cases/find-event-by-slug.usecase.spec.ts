import { Test, TestingModule } from '@nestjs/testing';
import { FindEventBySlugUseCase } from './find-event-by-slug.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { NotFoundException } from '@nestjs/common';
import { EventMapper } from '@events/mappers/event.mapper';

describe('FindEventBySlugUseCase', () => {
 let useCase: FindEventBySlugUseCase;
 let eventsRepository: EventsRepository;

 const mockEventsRepository = {
  findBySlug: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    FindEventBySlugUseCase,
    {
     provide: EventsRepository,
     useValue: mockEventsRepository,
    },
   ],
  }).compile();

  useCase = module.get<FindEventBySlugUseCase>(FindEventBySlugUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockSlug = 'festival-de-musica-2026-cuid123';

  const mockEventEntity = {
   id: 'evt-123',
   slug: mockSlug,
   title: 'Festival de Música',
   organizerId: 'org-1',
   createdAt: new Date(),
   deletedAt: null,
  };

  const mockEventResponseDto = {
   id: 'evt-123',
   title: 'Festival de Música',
   slug: mockSlug,
  };

  it('deve retornar o EventResponseDto quando o evento for encontrado', async () => {
   mockEventsRepository.findBySlug.mockResolvedValueOnce(mockEventEntity);

   const mapperSpy = jest.spyOn(EventMapper, 'toResponse').mockReturnValueOnce(mockEventResponseDto as any);

   const result = await useCase.execute(mockSlug);

   expect(mockEventsRepository.findBySlug).toHaveBeenCalledTimes(1);
   expect(mockEventsRepository.findBySlug).toHaveBeenCalledWith(mockSlug);

   expect(mapperSpy).toHaveBeenCalledWith(mockEventEntity);

   expect(result).toEqual(mockEventResponseDto);
  });

  it('deve lançar NotFoundException se o evento não for encontrado pelo slug', async () => {
   mockEventsRepository.findBySlug.mockResolvedValueOnce(null);

   const mapperSpy = jest.spyOn(EventMapper, 'toResponse');
   await expect(useCase.execute(mockSlug)).rejects.toThrow(
    new NotFoundException(`Evento com slug ${mockSlug} não encontrado.`)
   );

   expect(mockEventsRepository.findBySlug).toHaveBeenCalledWith(mockSlug);

   expect(mapperSpy).not.toHaveBeenCalled();
  });

  it('deve propagar a exceção se a busca no banco de dados falhar catastroficamente', async () => {
   const dbError = new Error('Database connection timeout');
   mockEventsRepository.findBySlug.mockRejectedValueOnce(dbError);
   await expect(useCase.execute(mockSlug)).rejects.toThrow(dbError);

   expect(mockEventsRepository.findBySlug).toHaveBeenCalledTimes(1);
  });
 });
});