import { Test, TestingModule } from '@nestjs/testing';
import { CreateTicketUseCase } from './create-ticket.usecase';
import { DataSource } from 'typeorm';
import { GenerateTicketTokenService } from '@services/generate-ticket-token.service';
import { DispatchTicketEmailUseCase } from './dispatch-ticket-email.usecase';
import { TicketMapper } from '@tickets/mappers/ticket.mapper';
import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '@tickets/entities/ticket.entity';

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
   event: { id: 'event-1' }
  };
  const mockTokenData = { ticketId: 't-123', token: 'token-abc' };
  const mockSavedTicket = { id: 't-123', qrCode: 'token-abc' };

  it('deve emitir um ingresso com sucesso e disparar e-mail', async () => {

   mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockTicketType);
   mockGenerateTicketTokenService.execute.mockReturnValueOnce(mockTokenData);
   mockQueryRunner.manager.create.mockReturnValueOnce(mockSavedTicket);
   mockQueryRunner.manager.save.mockResolvedValueOnce(mockSavedTicket);
   mockDispatchTicketEmailUseCase.execute.mockResolvedValueOnce(undefined);

   const mapperSpy = jest.spyOn(TicketMapper, 'toResponse').mockReturnValueOnce({ id: 't-123' } as any);


   const result = await useCase.execute(dto, userId);


   expect(mockQueryRunner.connect).toHaveBeenCalled();
   expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
   expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
   expect(mockQueryRunner.release).toHaveBeenCalled();

   expect(mockDispatchTicketEmailUseCase.execute).toHaveBeenCalledWith('t-123', 'token-abc');
   expect(mapperSpy).toHaveBeenCalled();
   expect(result).toHaveProperty('id', 't-123');
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

  it('deve lidar com falha no e-mail sem interromper o retorno do ticket', async () => {

   mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockTicketType);
   mockGenerateTicketTokenService.execute.mockReturnValueOnce(mockTokenData);
   mockQueryRunner.manager.save.mockResolvedValueOnce(mockSavedTicket);


   mockDispatchTicketEmailUseCase.execute.mockRejectedValueOnce(new Error('SMTP Error'));
   const loggerSpy = jest.spyOn(Logger.prototype, 'error');


   const result = await useCase.execute(dto, userId);


   expect(result).toBeDefined();
   expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
   expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Erro no processamento do e-mail'));
  });

  it('deve tratar erro de Unique Constraint (23505) como BadRequest', async () => {
   mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockTicketType);
   mockGenerateTicketTokenService.execute.mockReturnValueOnce(mockTokenData);

   const dbError = { code: '23505' };
   mockQueryRunner.manager.save.mockRejectedValueOnce(dbError);

   await expect(useCase.execute(dto, userId)).rejects.toThrow(BadRequestException);
   expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('deve lançar InternalServerErrorException para erros genéricos', async () => {
   mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockTicketType);
   mockQueryRunner.manager.save.mockRejectedValueOnce(new Error('Fatal Error'));

   await expect(useCase.execute(dto, userId)).rejects.toThrow(InternalServerErrorException);
  });
 });
});