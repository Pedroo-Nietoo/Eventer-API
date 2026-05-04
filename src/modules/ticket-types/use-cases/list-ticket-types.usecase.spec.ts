import { Test, TestingModule } from '@nestjs/testing';
import { ListTicketTypesUseCase } from './list-ticket-types.usecase';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@infra/redis/services/cache.service';

describe('ListTicketTypesUseCase', () => {
 let useCase: ListTicketTypesUseCase;

 const mockTicketTypesRepository = { findAllWithEvent: jest.fn() };
 const mockCacheService = { get: jest.fn(), set: jest.fn() };
 const mockConfigService = { get: jest.fn().mockReturnValue(300) };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    ListTicketTypesUseCase,
    { provide: TicketTypesRepository, useValue: mockTicketTypesRepository },
    { provide: CacheService, useValue: mockCacheService },
    { provide: ConfigService, useValue: mockConfigService },
   ],
  }).compile();
  useCase = module.get<ListTicketTypesUseCase>(ListTicketTypesUseCase);
 });

 afterEach(() => jest.clearAllMocks());

 it('deve retornar do cache', async () => {
  const mockCached = { data: [], meta: { totalItems: 0 } };
  mockCacheService.get.mockResolvedValueOnce(mockCached);
  const result = await useCase.execute({ page: 1, limit: 10 });
  expect(result).toEqual(mockCached);
 });

 it('deve usar o fallback de page se apenas limit for fornecido (cobre ramificação)', async () => {
  mockCacheService.get.mockResolvedValueOnce(null);
  mockTicketTypesRepository.findAllWithEvent.mockResolvedValueOnce([[], 0]);

  await useCase.execute({ limit: 15 });

  expect(mockTicketTypesRepository.findAllWithEvent).toHaveBeenCalledWith(0, 15);
 });

 it('deve usar o fallback de limit se apenas page for fornecido (cobre ramificação)', async () => {
  mockCacheService.get.mockResolvedValueOnce(null);
  mockTicketTypesRepository.findAllWithEvent.mockResolvedValueOnce([[], 0]);

  await useCase.execute({ page: 2 });

  expect(mockTicketTypesRepository.findAllWithEvent).toHaveBeenCalledWith(20, 20);
 });

 it('deve buscar no DB e salvar no cache', async () => {
  mockCacheService.get.mockResolvedValueOnce(null);
  mockTicketTypesRepository.findAllWithEvent.mockResolvedValueOnce([[{ id: '1' }], 1]);

  const result = await useCase.execute({ page: 1, limit: 10 });
  expect(mockCacheService.set).toHaveBeenCalledWith('ticket-types:list:1:10', result, 300);
 });
});