import { Test, TestingModule } from '@nestjs/testing';
import { FindTicketTypeUseCase } from './find-ticket-type.usecase';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '@infra/redis/services/cache.service';

describe('FindTicketTypeUseCase', () => {
 let useCase: FindTicketTypeUseCase;

 const mockTicketTypesRepository = { findById: jest.fn() };
 const mockCacheService = { get: jest.fn(), set: jest.fn() };
 const mockConfigService = { get: jest.fn().mockReturnValue(300) };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    FindTicketTypeUseCase,
    { provide: TicketTypesRepository, useValue: mockTicketTypesRepository },
    { provide: CacheService, useValue: mockCacheService },
    { provide: ConfigService, useValue: mockConfigService },
   ],
  }).compile();
  useCase = module.get<FindTicketTypeUseCase>(FindTicketTypeUseCase);
 });

 afterEach(() => jest.clearAllMocks());

 it('deve retornar do cache se existir', async () => {
  const mockCached = { id: '1', name: 'Lote' };
  mockCacheService.get.mockResolvedValueOnce(mockCached);

  const result = await useCase.execute('1');
  expect(mockTicketTypesRepository.findById).not.toHaveBeenCalled();
  expect(result).toEqual(mockCached);
 });

 it('deve buscar do DB, salvar no cache e retornar', async () => {
  mockCacheService.get.mockResolvedValueOnce(null);
  mockTicketTypesRepository.findById.mockResolvedValueOnce({ id: '1', name: 'Lote' });

  await useCase.execute('1');

  expect(mockTicketTypesRepository.findById).toHaveBeenCalledWith('1');
  expect(mockCacheService.set).toHaveBeenCalled();
 });

 it('deve lançar NotFoundException quando o lote não existir no DB', async () => {
  mockCacheService.get.mockResolvedValueOnce(null);
  mockTicketTypesRepository.findById.mockResolvedValueOnce(null);

  await expect(useCase.execute('1')).rejects.toThrow(NotFoundException);
 });
});