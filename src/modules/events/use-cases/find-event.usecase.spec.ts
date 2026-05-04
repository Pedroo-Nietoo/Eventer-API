import { Test, TestingModule } from '@nestjs/testing';
import { FindEventUseCase } from './find-event.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { NotFoundException } from '@nestjs/common';
import { EventMapper } from '@events/mappers/event.mapper';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@infra/redis/services/cache.service';

describe('FindEventUseCase', () => {
 let useCase: FindEventUseCase;
 let eventsRepository: EventsRepository;
 let cacheService: CacheService;

 const mockEventsRepository = { findById: jest.fn() };
 const mockCacheService = { get: jest.fn(), set: jest.fn() };
 const mockConfigService = { get: jest.fn().mockReturnValue(300) };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    FindEventUseCase,
    { provide: EventsRepository, useValue: mockEventsRepository },
    { provide: CacheService, useValue: mockCacheService },
    { provide: ConfigService, useValue: mockConfigService },
   ],
  }).compile();

  useCase = module.get<FindEventUseCase>(FindEventUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);
  cacheService = module.get<CacheService>(CacheService);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 const mockEventId = 'evt-123';
 const mockEventEntity = { id: mockEventId, slug: 'evento', title: 'Teste' };
 const mockEventResponseDto = { id: mockEventId, slug: 'evento', title: 'Teste' };

 it('deve retornar os dados do cache se existirem, sem consultar o banco', async () => {
  mockCacheService.get.mockResolvedValueOnce(mockEventResponseDto);

  const result = await useCase.execute(mockEventId);

  expect(mockCacheService.get).toHaveBeenCalledWith(`events:id:${mockEventId}`);
  expect(mockEventsRepository.findById).not.toHaveBeenCalled();
  expect(result).toEqual(mockEventResponseDto);
 });

 it('deve buscar no banco, salvar no cache e retornar o dto se o cache estiver vazio', async () => {
  mockCacheService.get.mockResolvedValueOnce(null);
  mockEventsRepository.findById.mockResolvedValueOnce(mockEventEntity);
  jest.spyOn(EventMapper, 'toResponse').mockReturnValue(mockEventResponseDto as any);

  const result = await useCase.execute(mockEventId);

  expect(mockEventsRepository.findById).toHaveBeenCalledWith(mockEventId);
  expect(mockCacheService.set).toHaveBeenCalledWith(`events:id:${mockEventId}`, mockEventResponseDto, 300);
  expect(result).toEqual(mockEventResponseDto);
 });

 it('deve lançar NotFoundException se não achar no cache nem no banco', async () => {
  mockCacheService.get.mockResolvedValueOnce(null);
  mockEventsRepository.findById.mockResolvedValueOnce(null);

  await expect(useCase.execute(mockEventId)).rejects.toThrow(NotFoundException);
  expect(mockCacheService.set).not.toHaveBeenCalled();
 });
});