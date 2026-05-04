import { Test, TestingModule } from '@nestjs/testing';
import { ListEventsUseCase } from './list-events.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { EventMapper } from '@events/mappers/event.mapper';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@infra/redis/services/cache.service';

describe('ListEventsUseCase', () => {
 let useCase: ListEventsUseCase;

 const mockEventsRepository = { findAll: jest.fn(), count: jest.fn() };
 const mockCacheService = { get: jest.fn(), set: jest.fn() };
 const mockConfigService = { get: jest.fn().mockReturnValue(300) };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    ListEventsUseCase,
    { provide: EventsRepository, useValue: mockEventsRepository },
    { provide: CacheService, useValue: mockCacheService },
    { provide: ConfigService, useValue: mockConfigService },
   ],
  }).compile();

  useCase = module.get<ListEventsUseCase>(ListEventsUseCase);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 const mockEvents = [{ id: '1' }, { id: '2' }];
 const mockResponseList = [{ id: '1' }, { id: '2' }];
 const mockCachedResponse = { data: mockResponseList, meta: { totalItems: 2 } };

 it('deve retornar dados do cache se disponíveis', async () => {
  mockCacheService.get.mockResolvedValueOnce(mockCachedResponse);

  const result = await useCase.execute({ page: 1, limit: 10 });

  expect(mockEventsRepository.findAll).not.toHaveBeenCalled();
  expect(result).toEqual(mockCachedResponse);
 });

 it('deve buscar no banco e salvar no cache se não houver cache', async () => {
  mockCacheService.get.mockResolvedValueOnce(null);
  mockEventsRepository.findAll.mockResolvedValueOnce(mockEvents);
  mockEventsRepository.count.mockResolvedValueOnce(25);
  jest.spyOn(EventMapper, 'toResponseList').mockReturnValue(mockResponseList as any);

  const result = await useCase.execute({ page: 1, limit: 10 });

  expect(mockEventsRepository.findAll).toHaveBeenCalledWith(0, 10);
  expect(mockCacheService.set).toHaveBeenCalledWith('events:list:1:10', result, 300);
  expect(result.data).toEqual(mockResponseList);
 });

 it('deve usar valores padrão quando page e limit não são fornecidos, e salvar no cache', async () => {
  mockCacheService.get.mockResolvedValueOnce(null);
  mockEventsRepository.findAll.mockResolvedValueOnce([]);
  mockEventsRepository.count.mockResolvedValueOnce(0);

  const result = await useCase.execute({});

  expect(mockEventsRepository.findAll).toHaveBeenCalledWith(0, 20);
  expect(mockCacheService.set).toHaveBeenCalledWith('events:list:1:20', result, 300);
  expect(result.meta.currentPage).toBe(1);
 });
});