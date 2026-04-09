import { Test, TestingModule } from '@nestjs/testing';
import { DispatchTicketEmailUseCase } from './dispatch-ticket-email.usecase';
import { TicketsRepository } from '@tickets/repository/ticket.repository';
import { MailService } from '@services/mail/mail.service';
import { GenerateQrCodeImageService } from '@services/generate-qrcode-image.service';
import { Logger } from '@nestjs/common';

describe('DispatchTicketEmailUseCase', () => {
 let useCase: DispatchTicketEmailUseCase;
 let ticketsRepository: TicketsRepository;
 let generateQrCodeImageService: GenerateQrCodeImageService;
 let mailService: MailService;

 const mockTicketsRepository = {
  findByIdWithRelations: jest.fn(),
 };

 const mockGenerateQrCodeImageService = {
  execute: jest.fn(),
 };

 const mockMailService = {
  sendTicketEmail: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    DispatchTicketEmailUseCase,
    { provide: TicketsRepository, useValue: mockTicketsRepository },
    { provide: GenerateQrCodeImageService, useValue: mockGenerateQrCodeImageService },
    { provide: MailService, useValue: mockMailService },
   ],
  }).compile();

  useCase = module.get<DispatchTicketEmailUseCase>(DispatchTicketEmailUseCase);
  ticketsRepository = module.get<TicketsRepository>(TicketsRepository);
  generateQrCodeImageService = module.get<GenerateQrCodeImageService>(GenerateQrCodeImageService);
  mailService = module.get<MailService>(MailService);


  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 describe('execute', () => {
  const ticketId = 't-123';
  const qrToken = 'token-secret';
  const mockTicket = {
   id: ticketId,
   user: { email: 'pedro@example.com', username: 'PedroNieto' },
   ticketType: {
    name: 'VIP',
    event: { title: 'NestJS Conference' },
   },
  };

  it('deve enviar o e-mail com sucesso quando todos os dados estão corretos', async () => {

   const mockBuffer = Buffer.from('qr-code-image');
   mockTicketsRepository.findByIdWithRelations.mockResolvedValueOnce(mockTicket);
   mockGenerateQrCodeImageService.execute.mockResolvedValueOnce(mockBuffer);
   mockMailService.sendTicketEmail.mockResolvedValueOnce(undefined);

   const logSpy = jest.spyOn(Logger.prototype, 'log');


   await useCase.execute(ticketId, qrToken);


   expect(ticketsRepository.findByIdWithRelations).toHaveBeenCalledWith(ticketId);
   expect(generateQrCodeImageService.execute).toHaveBeenCalledWith(qrToken);
   expect(mailService.sendTicketEmail).toHaveBeenCalledWith(
    'pedro@example.com',
    'PedroNieto',
    'NestJS Conference',
    'VIP',
    mockBuffer
   );
   expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('enviado para: pedro@example.com'));
  });

  it('deve logar um aviso e retornar se o ticket não for encontrado', async () => {

   mockTicketsRepository.findByIdWithRelations.mockResolvedValueOnce(null);
   const warnSpy = jest.spyOn(Logger.prototype, 'warn');


   await useCase.execute(ticketId, qrToken);


   expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('ticket inexistente'));
   expect(mailService.sendTicketEmail).not.toHaveBeenCalled();
  });

  it('deve logar um aviso se o usuário não tiver e-mail cadastrado', async () => {

   mockTicketsRepository.findByIdWithRelations.mockResolvedValueOnce({
    ...mockTicket,
    user: { email: null },
   });
   const warnSpy = jest.spyOn(Logger.prototype, 'warn');


   await useCase.execute(ticketId, qrToken);


   expect(warnSpy).toHaveBeenCalled();
   expect(generateQrCodeImageService.execute).not.toHaveBeenCalled();
  });

  it('deve capturar e logar erro se a geração do QR Code falhar', async () => {

   mockTicketsRepository.findByIdWithRelations.mockResolvedValueOnce(mockTicket);
   const errorMsg = 'Falha no gerador de imagem';
   mockGenerateQrCodeImageService.execute.mockRejectedValueOnce(new Error(errorMsg));

   const errorSpy = jest.spyOn(Logger.prototype, 'error');


   await useCase.execute(ticketId, qrToken);


   expect(errorSpy).toHaveBeenCalledWith(
    expect.stringContaining(`Falha ao disparar e-mail do ticket ${ticketId}: ${errorMsg}`)
   );
   expect(mailService.sendTicketEmail).not.toHaveBeenCalled();
  });

  it('deve capturar e logar erro se o serviço de e-mail falhar', async () => {

   mockTicketsRepository.findByIdWithRelations.mockResolvedValueOnce(mockTicket);
   mockGenerateQrCodeImageService.execute.mockResolvedValueOnce(Buffer.from('...'));
   mockMailService.sendTicketEmail.mockRejectedValueOnce(new Error('SMTP Error'));

   const errorSpy = jest.spyOn(Logger.prototype, 'error');


   await useCase.execute(ticketId, qrToken);


   expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('SMTP Error'));
  });
 });
});