import { Test, TestingModule } from '@nestjs/testing';
import { CreateTicketTypeUseCase } from './create-ticket-type.usecase';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { TicketTypeMapper } from '@ticket-types/mappers/ticket-type.mapper';
import { CreateTicketTypeDto } from '@ticket-types/dto/create-ticket-type.dto';
import { Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CacheService } from '@infra/redis/services/cache.service';

describe('CreateTicketTypeUseCase', () => {
 let useCase: CreateTicketTypeUseCase;

 const mockTicketTypesRepository = { create: jest.fn(), save: jest.fn() };
 const mockCacheService = { delByPattern: jest.fn() };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    CreateTicketTypeUseCase,
    { provide: TicketTypesRepository, useValue: mockTicketTypesRepository },
    { provide: CacheService, useValue: mockCacheService },
   ],
  }).compile();

  useCase = module.get<CreateTicketTypeUseCase>(CreateTicketTypeUseCase);
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => jest.clearAllMocks());

 const mockDto: CreateTicketTypeDto = { name: 'VIP', price: 250, totalQuantity: 100, eventId: '123' };
 const mockEntity = { ...mockDto, id: 't-1' };

 it('deve criar, invalidar cache e retornar a entidade', async () => {
  mockTicketTypesRepository.create.mockReturnValue(mockEntity);
  mockTicketTypesRepository.save.mockResolvedValueOnce(mockEntity);
  jest.spyOn(TicketTypeMapper, 'toResponse').mockReturnValue(mockEntity as any);

  const result = await useCase.execute(mockDto);

  expect(mockCacheService.delByPattern).toHaveBeenCalledWith('ticket-types:list:*');
  expect(result.id).toBe('t-1');
 });

 it('deve lançar NotFoundException se o evento não existir (23503)', async () => {
  mockTicketTypesRepository.create.mockReturnValue(mockEntity);
  mockTicketTypesRepository.save.mockRejectedValueOnce({ code: '23503' });

  await expect(useCase.execute(mockDto)).rejects.toThrow(NotFoundException);
 });

 it('deve lançar erro genérico e usar o fallback se dbError não tiver message ou stack', async () => {
  mockTicketTypesRepository.create.mockReturnValue(mockEntity);

  mockTicketTypesRepository.save.mockRejectedValueOnce({});

  const loggerSpy = jest.spyOn(Logger.prototype, 'error');

  await expect(useCase.execute(mockDto)).rejects.toThrow(InternalServerErrorException);

  expect(loggerSpy).toHaveBeenCalledWith('Erro ao criar tipo de ingresso: Erro desconhecido', 'Sem stack trace');
 });
});