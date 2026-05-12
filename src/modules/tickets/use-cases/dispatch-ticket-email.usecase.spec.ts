import { Test, TestingModule } from '@nestjs/testing';
import { DispatchTicketEmailUseCase } from './dispatch-ticket-email.usecase';
import { getQueueToken } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

describe('DispatchTicketEmailUseCase', () => {
 let useCase: DispatchTicketEmailUseCase;
 let mailQueue: Queue;

 const mockMailQueue = {
  add: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    DispatchTicketEmailUseCase,
    { provide: getQueueToken('mail-queue'), useValue: mockMailQueue },
   ],
  }).compile();

  useCase = module.get<DispatchTicketEmailUseCase>(DispatchTicketEmailUseCase);
  mailQueue = module.get<Queue>(getQueueToken('mail-queue'));

  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 describe('execute', () => {
  const ticketId = 't-123';
  const qrToken = 'token-secret';

  it('deve adicionar o job de e-mail na fila com sucesso', async () => {
   mockMailQueue.add.mockResolvedValueOnce({ id: 'job-id' });
   const logSpy = jest.spyOn(Logger.prototype, 'log');

   await useCase.execute(ticketId, qrToken);

   expect(mockMailQueue.add).toHaveBeenCalledWith(
    'send-ticket-email',
    { ticketId, qrCodeToken: qrToken },
    {
     attempts: 3,
     backoff: { type: 'exponential' },
    },
   );
   expect(logSpy).toHaveBeenCalledWith(`Job de e-mail enfileirado com sucesso para o ticket: ${ticketId}`);
  });

  it('deve capturar e logar erro se a inserção na fila falhar (Instância de Error)', async () => {
   const errorMsg = 'Redis connection failed';
   mockMailQueue.add.mockRejectedValueOnce(new Error(errorMsg));
   const errorSpy = jest.spyOn(Logger.prototype, 'error');

   await useCase.execute(ticketId, qrToken);

   expect(errorSpy).toHaveBeenCalledWith(
    `Falha ao colocar o e-mail do ticket ${ticketId} na fila: ${errorMsg}`,
   );
  });

  it('deve capturar e logar erro se a inserção na fila falhar (Erro desconhecido)', async () => {
   mockMailQueue.add.mockRejectedValueOnce('String de Erro Desconhecido');
   const errorSpy = jest.spyOn(Logger.prototype, 'error');

   await useCase.execute(ticketId, qrToken);

   expect(errorSpy).toHaveBeenCalledWith(
    `Falha ao colocar o e-mail do ticket ${ticketId} na fila: Erro desconhecido ao enfileirar e-mail`,
   );
  });
 });
});