import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTicketUseCase } from './delete-ticket.usecase';
import { DataSource } from 'typeorm';
import { TicketStatus, Ticket } from '@tickets/entities/ticket.entity';
import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

describe('DeleteTicketUseCase', () => {
 let useCase: DeleteTicketUseCase;
 let dataSource: DataSource;


 const mockQueryBuilder = {
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue({}),
 };

 const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
   update: jest.fn(),
   createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  },
 };

 const mockTicketRepo = {
  findOne: jest.fn(),
 };

 const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockTicketRepo),
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    DeleteTicketUseCase,
    { provide: DataSource, useValue: mockDataSource },
   ],
  }).compile();

  useCase = module.get<DeleteTicketUseCase>(DeleteTicketUseCase);
  dataSource = module.get<DataSource>(DataSource);

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const ticketId = 't-123';
  const mockTicket = {
   id: ticketId,
   status: TicketStatus.VALID,
   ticketType: { id: 'type-1' },
  };

  it('deve cancelar o ingresso e devolver o estoque com sucesso', async () => {
   mockTicketRepo.findOne.mockResolvedValueOnce(mockTicket);
   mockQueryRunner.manager.update.mockResolvedValueOnce({});
   mockQueryBuilder.execute.mockResolvedValueOnce({});

   await useCase.execute(ticketId);

   expect(mockQueryRunner.connect).toHaveBeenCalled();
   expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
   expect(mockQueryRunner.manager.createQueryBuilder).toHaveBeenCalled();
   expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
    Ticket,
    { id: ticketId },
    { status: TicketStatus.CANCELLED }
   );
   expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
   expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se o ingresso não existir', async () => {
   mockTicketRepo.findOne.mockResolvedValueOnce(null);

   await expect(useCase.execute(ticketId)).rejects.toThrow(
    new NotFoundException('Ingresso não encontrado para exclusão.')
   );

   expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException se o ingresso já estiver cancelado', async () => {
   mockTicketRepo.findOne.mockResolvedValueOnce({
    ...mockTicket,
    status: TicketStatus.CANCELLED
   });

   await expect(useCase.execute(ticketId)).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException se o ingresso já tiver sido usado', async () => {
   mockTicketRepo.findOne.mockResolvedValueOnce({
    ...mockTicket,
    status: TicketStatus.USED
   });

   await expect(useCase.execute(ticketId)).rejects.toThrow(BadRequestException);
  });

  it('deve fazer rollback e lançar InternalServerErrorException em caso de erro na transação', async () => {

   mockTicketRepo.findOne.mockResolvedValueOnce(mockTicket);


   mockQueryBuilder.execute.mockRejectedValueOnce(new Error('Falha no Banco'));


   await expect(useCase.execute(ticketId)).rejects.toThrow(InternalServerErrorException);

   expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
   expect(mockQueryRunner.release).toHaveBeenCalled();
  });
 });
});