import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTicketUseCase } from './update-ticket.usecase';
import { DataSource } from 'typeorm';
import { TicketStatus } from '@tickets/entities/ticket.entity';
import { FindTicketUseCase } from './find-ticket.usecase';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

describe('UpdateTicketUseCase', () => {
  let useCase: UpdateTicketUseCase;


  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };


  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTicketUseCase,
        { provide: DataSource, useValue: mockDataSource },
        { provide: FindTicketUseCase, useValue: {} },
      ],
    }).compile();

    useCase = module.get<UpdateTicketUseCase>(UpdateTicketUseCase);


    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const ticketId = 't-123';
    const userId = 'u-456';


    const createMockTicket = (status = TicketStatus.VALID) => ({
      id: ticketId,
      status,
      purchasePrice: 50,
      ticketType: {
        id: 'type-old',
        price: 50,
        event: { id: 'event-1' }
      },
    });

    it('deve permitir trocar de lote dentro do mesmo evento', async () => {

      const originalTicket = createMockTicket();
      const newTicketType = {
        id: 'type-new',
        price: 80,
        event: { id: 'event-1' }
      };


      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(originalTicket)
        .mockResolvedValueOnce(newTicketType)
        .mockResolvedValueOnce({ ...originalTicket, ticketType: newTicketType });

      mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });
      mockQueryRunner.manager.save.mockResolvedValue({});


      await useCase.execute(ticketId, { ticketTypeId: 'type-new' }, userId);


      expect(mockQueryBuilder.execute).toHaveBeenCalledTimes(2);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('deve impedir a troca de lote para um evento diferente', async () => {

      const originalTicket = createMockTicket();
      const diffEventTicketType = {
        id: 'type-new',
        price: 80,
        event: { id: 'EVENTO-B' }
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(originalTicket)
        .mockResolvedValueOnce(diffEventTicketType);


      await expect(useCase.execute(ticketId, { ticketTypeId: 'type-new' }, userId))
        .rejects.toThrow(new BadRequestException('Não é possível transferir um ingresso para um evento diferente.'));

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).not.toHaveBeenCalled();
    });

    it('deve impedir a troca se o novo lote não tiver estoque', async () => {

      const originalTicket = createMockTicket();
      const newTicketType = { id: 'type-new', price: 80, event: { id: 'event-1' } };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(originalTicket)
        .mockResolvedValueOnce(newTicketType);


      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 1 });

      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 0 });


      await expect(useCase.execute(ticketId, { ticketTypeId: 'type-new' }, userId))
        .rejects.toThrow(new BadRequestException('O novo lote selecionado não possui estoque disponível.'));

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('deve falhar ao reativar ingresso se não houver estoque disponível', async () => {

      const cancelledTicket = createMockTicket(TicketStatus.CANCELLED);
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(cancelledTicket);


      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 0 });


      await expect(useCase.execute(ticketId, { status: TicketStatus.VALID }, userId))
        .rejects.toThrow(new BadRequestException('Não há estoque disponível para reativar este ingresso.'));

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se o ingresso não for encontrado após o save', async () => {

      const originalTicket = createMockTicket();
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(originalTicket)
        .mockResolvedValueOnce(null);

      mockQueryRunner.manager.save.mockResolvedValueOnce({});


      await expect(useCase.execute(ticketId, { status: TicketStatus.VALID }, userId))
        .rejects.toThrow(new NotFoundException('Ingresso não encontrado após atualização.'));
    });

    it('deve lançar InternalServerErrorException em caso de erro de banco genérico', async () => {

      mockQueryRunner.manager.findOne.mockRejectedValueOnce(new Error('Conexão perdida'));


      await expect(useCase.execute(ticketId, {}, userId))
        .rejects.toThrow(InternalServerErrorException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});