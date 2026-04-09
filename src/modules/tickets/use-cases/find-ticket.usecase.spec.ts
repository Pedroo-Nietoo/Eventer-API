import { Test, TestingModule } from '@nestjs/testing';
import { FindTicketUseCase } from './find-ticket.usecase';
import { TicketsRepository } from '@tickets/repository/ticket.repository';
import { TicketMapper } from '@tickets/mappers/ticket.mapper';
import { NotFoundException } from '@nestjs/common';

describe('FindTicketUseCase', () => {
 let useCase: FindTicketUseCase;
 let ticketsRepository: TicketsRepository;

 const mockTicketsRepository = {
  findByIdWithRelations: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    FindTicketUseCase,
    {
     provide: TicketsRepository,
     useValue: mockTicketsRepository,
    },
   ],
  }).compile();

  useCase = module.get<FindTicketUseCase>(FindTicketUseCase);
  ticketsRepository = module.get<TicketsRepository>(TicketsRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const ticketId = 'ticket-uuid-123';

  const mockTicketEntity = {
   id: ticketId,
   qrCode: 'token-abc',
   status: 'VALID',
   user: { id: 'user-1', email: 'user@test.com' },
   ticketType: { id: 'type-1', name: 'VIP' },
  };

  const mockResponseDto = {
   id: ticketId,
   status: 'VALID',
  };

  it('deve retornar o ticket mapeado com sucesso quando encontrado', async () => {

   mockTicketsRepository.findByIdWithRelations.mockResolvedValueOnce(mockTicketEntity);
   const mapperSpy = jest.spyOn(TicketMapper, 'toResponse').mockReturnValueOnce(mockResponseDto as any);


   const result = await useCase.execute(ticketId);


   expect(ticketsRepository.findByIdWithRelations).toHaveBeenCalledWith(ticketId);
   expect(mapperSpy).toHaveBeenCalledWith(mockTicketEntity);
   expect(result).toEqual(mockResponseDto);
  });

  it('deve lançar NotFoundException quando o ingresso não for encontrado', async () => {

   mockTicketsRepository.findByIdWithRelations.mockResolvedValueOnce(null);
   const mapperSpy = jest.spyOn(TicketMapper, 'toResponse');


   await expect(useCase.execute(ticketId)).rejects.toThrow(
    new NotFoundException('Ingresso não encontrado.')
   );

   expect(mapperSpy).not.toHaveBeenCalled();
  });

  it('deve propagar erros do repositório', async () => {

   const dbError = new Error('Erro de conexão com o banco');
   mockTicketsRepository.findByIdWithRelations.mockRejectedValueOnce(dbError);


   await expect(useCase.execute(ticketId)).rejects.toThrow(dbError);
  });
 });
});