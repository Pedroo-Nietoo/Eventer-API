import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ListOrganizerEventsUseCase } from './list-organizer-events.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { CacheService } from '@infra/redis/services/cache.service';
import { EventMapper } from '@events/mappers/event.mapper';

describe('ListOrganizerEventsUseCase', () => {
 let useCase: ListOrganizerEventsUseCase;
 let eventsRepository: EventsRepository;
 let cacheService: CacheService;

 const mockOrganizerId = 'organizer-uuid';
 const mockPagination = { page: 1, limit: 10 };
 const mockEvent = { id: '1', title: 'Evento Teste', organizerId: mockOrganizerId };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    ListOrganizerEventsUseCase,
    {
     provide: EventsRepository,
     useValue: { findByOrganizer: jest.fn() },
    },
    {
     provide: CacheService,
     useValue: { get: jest.fn(), set: jest.fn() },
    },
    {
     provide: ConfigService,
     useValue: { get: jest.fn().mockReturnValue(300) },
    },
   ],
  }).compile();

  useCase = module.get<ListOrganizerEventsUseCase>(ListOrganizerEventsUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);
  cacheService = module.get<CacheService>(CacheService);
 });

 it('deve retornar dados do cache se disponíveis', async () => {
  const cachedResponse = { data: [], meta: {} };
  jest.spyOn(cacheService, 'get').mockResolvedValue(cachedResponse);

  const result = await useCase.execute(mockOrganizerId, mockPagination);

  expect(cacheService.get).toHaveBeenCalled();
  expect(eventsRepository.findByOrganizer).not.toHaveBeenCalled();
  expect(result).toEqual(cachedResponse);
 });

 it('deve buscar no repositório e salvar no cache quando não houver cache', async () => {
  jest.spyOn(cacheService, 'get').mockResolvedValue(null);
  jest.spyOn(eventsRepository, 'findByOrganizer').mockResolvedValue([[mockEvent as any], 1]);

  const mapperSpy = jest.spyOn(EventMapper, 'toResponseList').mockReturnValue([mockEvent as any]);

  const result = await useCase.execute(mockOrganizerId, mockPagination);

  expect(eventsRepository.findByOrganizer).toHaveBeenCalledWith(mockOrganizerId, 0, 10);
  expect(cacheService.set).toHaveBeenCalled();
  expect(result.data).toHaveLength(1);
  expect(result.meta.totalItems).toBe(1);

  mapperSpy.mockRestore();
 });

 it('deve calcular corretamente o "skip" para paginação', async () => {
  jest.spyOn(cacheService, 'get').mockResolvedValue(null);
  const repoSpy = jest.spyOn(eventsRepository, 'findByOrganizer').mockResolvedValue([[], 0]);

  await useCase.execute(mockOrganizerId, { page: 3, limit: 10 });

  expect(repoSpy).toHaveBeenCalledWith(mockOrganizerId, 20, 10);
 });
});