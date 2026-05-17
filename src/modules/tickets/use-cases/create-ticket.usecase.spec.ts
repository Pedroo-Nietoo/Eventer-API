import { Test, TestingModule } from '@nestjs/testing';
import { CreateTicketUseCase } from './create-ticket.usecase';
import { DataSource } from 'typeorm';
import { GenerateTicketTokenService } from '@services/generate-ticket-token.service';
import { DispatchTicketEmailUseCase } from './dispatch-ticket-email.usecase';
import { TicketMapper } from '@tickets/mappers/ticket.mapper';
import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

describe('CreateTicketUseCase', () => {
 let useCase: CreateTicketUseCase;
 let dataSource: DataSource;
 let generateTicketTokenService: GenerateTicketTokenService;
 let dispatchTicketEmailUseCase: DispatchTicketEmailUseCase;

 const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
   findOne: jest.fn(),
   create: jest.fn(),
   save: jest.fn(),
  },
 };

 const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
 };

 const mockGenerateTicketTokenService = {
  execute: jest.fn(),
 };

 const mockDispatchTicketEmailUseCase = {
  execute: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    CreateTicketUseCase,
    { provide: DataSource, useValue: mockDataSource },
    { provide: GenerateTicketTokenService, useValue: mockGenerateTicketTokenService },
    { provide: DispatchTicketEmailUseCase, useValue: mockDispatchTicketEmailUseCase },
   ],
  }).compile();

  useCase = module.get<CreateTicketUseCase>(CreateTicketUseCase);
  dataSource = module.get<DataSource>(DataSource);
  generateTicketTokenService = module.get<GenerateTicketTokenService>(GenerateTicketTokenService);
  dispatchTicketEmailUseCase = module.get<DispatchTicketEmailUseCase>(DispatchTicketEmailUseCase);

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 describe('execute', () => {
  const userId = 'user-1';
  const dto = { ticketTypeId: 'type-1', eventId: 'event-1' };
  const mockTicketType = {
   id: 'type-1',
   price: 100,
   event: { id: 'event-1' },
  };

  it('deve emitir ingressos em lote com sucesso e disparar e-mails', async () => {
   const quantity = 2;
   mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockTicketType);

   mockGenerateTicketTokenService.execute
    .mockReturnValueOnce({ ticketId: 't-1', token: 'token-1' })
    .mockReturnValueOnce({ ticketId: 't-2', token: 'token-2' });

   mockQueryRunner.manager.create.mockImplementation((entity, data) => data);

   const mockSavedTickets = [
    { id: 't-1', qrCode: 'token-1' },
    { id: 't-2', qrCode: 'token-2' },
   ];
   mockQueryRunner.manager.save.mockResolvedValueOnce(mockSavedTickets);
   mockDispatchTicketEmailUseCase.execute.mockResolvedValue(undefined);

   const mapperSpy = jest
    .spyOn(TicketMapper, 'toResponse')
    .mockImplementation((ticket: any) => ({ id: ticket.id } as any));

   const result = await useCase.execute(dto, userId, quantity);

   expect(mockQueryRunner.connect).toHaveBeenCalled();
   expect(mockQueryRunner.startTransaction).toHaveBeenCalled();

   expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(1);
   expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(expect.any(Array));

   expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
   expect(mockQueryRunner.release).toHaveBeenCalled();

   expect(mockDispatchTicketEmailUseCase.execute).toHaveBeenCalledTimes(2);
   expect(mockDispatchTicketEmailUseCase.execute).toHaveBeenCalledWith('t-1', 'token-1');
   expect(mockDispatchTicketEmailUseCase.execute).toHaveBeenCalledWith('t-2', 'token-2');

   expect(mapperSpy).toHaveBeenCalledTimes(2);
   expect(result).toHaveLength(2);
   expect(result).toEqual([{ id: 't-1' }, { id: 't-2' }]);
  });

  it('deve lançar BadRequestException se o evento do DTO não for o do lote', async () => {
   mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockTicketType);
   const invalidDto = { ...dto, eventId: 'event-errado' };

   await expect(useCase.execute(invalidDto, userId)).rejects.toThrow(BadRequestException);
   expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
   expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se o lote não existir', async () => {
   mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);

   await expect(useCase.execute(dto, userId)).rejects.toThrow(NotFoundException);
   expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('deve tratar erro de Unique Constraint (23505) como BadRequest', async () => {
   mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockTicketType);
   mockGenerateTicketTokenService.execute.mockReturnValueOnce({ ticketId: 't-1', token: 'token-1' });

   const dbError = { code: '23505' };
   mockQueryRunner.manager.save.mockRejectedValueOnce(dbError);

   await expect(useCase.execute(dto, userId)).rejects.toThrow(BadRequestException);
   expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('deve tratar erro de Foreign Key (23503) como NotFoundException de usuário inválido', async () => {
   mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockTicketType);
   mockGenerateTicketTokenService.execute.mockReturnValueOnce({ ticketId: 't-1', token: 'token-1' });

   const dbError = { code: '23503' };
   mockQueryRunner.manager.save.mockRejectedValueOnce(dbError);

   await expect(useCase.execute(dto, userId)).rejects.toThrow(NotFoundException);
   expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('deve lançar InternalServerErrorException para erros genéricos', async () => {
   mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockTicketType);
   mockGenerateTicketTokenService.execute.mockReturnValueOnce({ ticketId: 't-1', token: 'token-1' });
   mockQueryRunner.manager.save.mockRejectedValueOnce(new Error('Fatal Error'));

   await expect(useCase.execute(dto, userId)).rejects.toThrow(InternalServerErrorException);
  });
 });
});