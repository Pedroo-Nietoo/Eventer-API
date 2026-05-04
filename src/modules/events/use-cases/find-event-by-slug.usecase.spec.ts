import { Test, TestingModule } from '@nestjs/testing';
import { FindEventBySlugUseCase } from './find-event-by-slug.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { NotFoundException } from '@nestjs/common';
import { EventMapper } from '@events/mappers/event.mapper';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@infra/redis/services/cache.service';

describe('FindEventBySlugUseCase', () => {
 let useCase: FindEventBySlugUseCase;
 let eventsRepository: EventsRepository;

 const mockEventsRepository = { findBySlug: jest.fn() };
 const mockCacheService = { get: jest.fn(), set: jest.fn() };
 const mockConfigService = { get: jest.fn().mockReturnValue(300) };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    FindEventBySlugUseCase,
    { provide: EventsRepository, useValue: mockEventsRepository },
    { provide: CacheService, useValue: mockCacheService },
    { provide: ConfigService, useValue: mockConfigService },
   ],
  }).compile();

  useCase = module.get<FindEventBySlugUseCase>(FindEventBySlugUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 const mockSlug = 'meu-evento';
 const mockEventEntity = { id: '1', slug: mockSlug };
 const mockEventResponseDto = { id: '1', slug: mockSlug };

 it('deve retornar do cache se existir', async () => {
  mockCacheService.get.mockResolvedValueOnce(mockEventResponseDto);

  const result = await useCase.execute(mockSlug);

  expect(mockEventsRepository.findBySlug).not.toHaveBeenCalled();
  expect(result).toEqual(mockEventResponseDto);
 });

 it('deve buscar no banco, salvar no cache e retornar se não estiver no cache', async () => {
  mockCacheService.get.mockResolvedValueOnce(null);
  mockEventsRepository.findBySlug.mockResolvedValueOnce(mockEventEntity);
  jest.spyOn(EventMapper, 'toResponse').mockReturnValue(mockEventResponseDto as any);

  const result = await useCase.execute(mockSlug);

  expect(mockEventsRepository.findBySlug).toHaveBeenCalledWith(mockSlug);
  expect(mockCacheService.set).toHaveBeenCalledWith(`events:slug:${mockSlug}`, mockEventResponseDto, 300);
  expect(result).toEqual(mockEventResponseDto);
 });

 it('deve lançar NotFoundException se o evento não existir', async () => {
  mockCacheService.get.mockResolvedValueOnce(null);
  mockEventsRepository.findBySlug.mockResolvedValueOnce(null);

  await expect(useCase.execute(mockSlug)).rejects.toThrow(NotFoundException);
  expect(mockCacheService.set).not.toHaveBeenCalled();
 });
});