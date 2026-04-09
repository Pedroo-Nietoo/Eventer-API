import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';
import { BadRequestException } from '@nestjs/common';
import { TicketTypesRepository } from './ticket-type.repository';

describe('TicketTypesRepository', () => {
  let repository: TicketTypesRepository;
  let typeormRepo: Repository<TicketType>;


  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };


  const mockTypeORMRepo = {
    findAndCount: jest.fn(),

  };


  const mockEntityManager = {
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    }),
  } as unknown as EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketTypesRepository,
        {
          provide: getRepositoryToken(TicketType),
          useValue: mockTypeORMRepo,
        },
      ],
    }).compile();

    repository = module.get<TicketTypesRepository>(TicketTypesRepository);
    typeormRepo = module.get<Repository<TicketType>>(getRepositoryToken(TicketType));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  describe('findAllWithEvent', () => {
    it('deve buscar lotes com eventos, respeitando skip, take e order', async () => {
      const skip = 0;
      const take = 10;
      const mockResult = [[{ id: 'lote-1' }], 1];

      mockTypeORMRepo.findAndCount.mockResolvedValueOnce(mockResult);

      const result = await repository.findAllWithEvent(skip, take);

      expect(typeormRepo.findAndCount).toHaveBeenCalledWith({
        relations: { event: true },
        skip,
        take,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('decrementStock', () => {
    const ticketTypeId = 'lote-123';
    const quantity = 2;

    it('deve decrementar o estoque com sucesso em uma transação', async () => {

      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 1 });

      await repository.decrementStock(ticketTypeId, quantity, mockEntityManager);

      expect(mockEntityManager.getRepository).toHaveBeenCalledWith(TicketType);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(TicketType);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        availableQuantity: expect.any(Function),
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'id = :id AND available_quantity >= :quantity',
        { id: ticketTypeId, quantity }
      );
    });

    it('deve lançar BadRequestException se o estoque for insuficiente (affected: 0)', async () => {

      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 0 });

      await expect(
        repository.decrementStock(ticketTypeId, quantity, mockEntityManager)
      ).rejects.toThrow(new BadRequestException('Ingressos insuficientes para este lote.'));
    });
  });

  describe('incrementStock', () => {
    const ticketTypeId = 'lote-456';
    const quantity = 1;

    it('deve incrementar o estoque com sucesso em uma transação', async () => {
      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 1 });

      await repository.incrementStock(ticketTypeId, quantity, mockEntityManager);

      expect(mockEntityManager.getRepository).toHaveBeenCalledWith(TicketType);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(TicketType);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        availableQuantity: expect.any(Function),
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id = :id', { id: ticketTypeId });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });
});