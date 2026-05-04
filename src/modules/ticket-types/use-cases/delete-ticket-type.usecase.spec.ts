import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTicketTypeUseCase } from './delete-ticket-type.usecase';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CacheService } from '@infra/redis/services/cache.service';

describe('DeleteTicketTypeUseCase', () => {
 let useCase: DeleteTicketTypeUseCase;

 const mockTicketTypesRepository = { findById: jest.fn(), softDelete: jest.fn() };
 const mockCacheService = { del: jest.fn(), delByPattern: jest.fn() };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    DeleteTicketTypeUseCase,
    { provide: TicketTypesRepository, useValue: mockTicketTypesRepository },
    { provide: CacheService, useValue: mockCacheService },
   ],
  }).compile();
  useCase = module.get<DeleteTicketTypeUseCase>(DeleteTicketTypeUseCase);
 });

 afterEach(() => jest.clearAllMocks());

 it('deve excluir o lote e invalidar o cache', async () => {
  mockTicketTypesRepository.findById.mockResolvedValueOnce({ totalQuantity: 100, availableQuantity: 100 });
  mockTicketTypesRepository.softDelete.mockResolvedValueOnce({ affected: 1 });

  await useCase.execute('1');

  expect(mockTicketTypesRepository.softDelete).toHaveBeenCalledWith('1');
  expect(mockCacheService.del).toHaveBeenCalled();
 });

 it('deve lançar NotFoundException se o lote não for achado no banco', async () => {
  mockTicketTypesRepository.findById.mockResolvedValueOnce(null);
  await expect(useCase.execute('1')).rejects.toThrow(NotFoundException);
 });

 it('deve lançar BadRequestException se houver ingressos vendidos', async () => {
  mockTicketTypesRepository.findById.mockResolvedValueOnce({ totalQuantity: 100, availableQuantity: 95 });
  await expect(useCase.execute('1')).rejects.toThrow(BadRequestException);
 });

 it('deve lançar NotFoundException se o softDelete falhar (affected === 0)', async () => {
  mockTicketTypesRepository.findById.mockResolvedValueOnce({ totalQuantity: 10, availableQuantity: 10 });
  mockTicketTypesRepository.softDelete.mockResolvedValueOnce({ affected: 0 });

  await expect(useCase.execute('1')).rejects.toThrow(NotFoundException);
  expect(mockCacheService.del).not.toHaveBeenCalled();
 });
});