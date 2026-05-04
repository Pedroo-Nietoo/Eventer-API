import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTicketTypeUseCase } from './update-ticket-type.usecase';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CacheService } from '@infra/redis/services/cache.service';

describe('UpdateTicketTypeUseCase', () => {
  let useCase: UpdateTicketTypeUseCase;

  const mockManager = {
    findOne: jest.fn(),
    save: jest.fn(),
    transaction: jest.fn().mockImplementation(async (cb) => await cb(mockManager)),
  };

  const mockTicketTypesRepository = { get manager() { return mockManager; } };
  const mockCacheService = { del: jest.fn(), delByPattern: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTicketTypeUseCase,
        { provide: TicketTypesRepository, useValue: mockTicketTypesRepository },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();
    useCase = module.get<UpdateTicketTypeUseCase>(UpdateTicketTypeUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  const mockTicketType = { id: '1', name: 'Lote', totalQuantity: 100, availableQuantity: 80 };

  it('deve atualizar o estoque com sucesso', async () => {
    mockManager.findOne.mockResolvedValueOnce({ ...mockTicketType });
    mockManager.save.mockImplementationOnce((val) => Promise.resolve(val));

    await useCase.execute('1', { totalQuantity: 150 });

    expect(mockManager.save).toHaveBeenCalled();
    expect(mockCacheService.del).toHaveBeenCalledWith('ticket-types:id:1');
    expect(mockCacheService.delByPattern).toHaveBeenCalledWith('ticket-types:list:*');
  });

  it('deve atualizar apenas nome (sem passar totalQuantity) e não checar o if de estoque', async () => {
    mockManager.findOne.mockResolvedValueOnce({ ...mockTicketType });
    mockManager.save.mockImplementationOnce((val) => Promise.resolve(val));

    await useCase.execute('1', { name: 'Novo Nome' });

    expect(mockManager.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Novo Nome', availableQuantity: 80 }));
  });

  it('deve passar direto se totalQuantity enviada for exata e igual a do banco', async () => {
    mockManager.findOne.mockResolvedValueOnce({ ...mockTicketType });
    mockManager.save.mockImplementationOnce((val) => Promise.resolve(val));

    await useCase.execute('1', { totalQuantity: 100, name: 'Editado' });

    expect(mockManager.save).toHaveBeenCalledWith(expect.objectContaining({ totalQuantity: 100, name: 'Editado' }));
  });

  it('deve lançar BadRequestException se quantidade for menor que ingressos já vendidos', async () => {
    mockManager.findOne.mockResolvedValueOnce({ ...mockTicketType });

    await expect(useCase.execute('1', { totalQuantity: 15 })).rejects.toThrow(BadRequestException);
    expect(mockCacheService.del).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se o lote não existir na transação', async () => {
    mockManager.findOne.mockResolvedValueOnce(null);

    await expect(useCase.execute('1', { name: 'Teste' })).rejects.toThrow(NotFoundException);
    expect(mockCacheService.del).not.toHaveBeenCalled();
  });
});