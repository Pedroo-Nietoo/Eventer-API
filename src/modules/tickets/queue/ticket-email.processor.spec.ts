import { Test, TestingModule } from '@nestjs/testing';
import { TicketEmailProcessor } from './ticket-email.processor';
import { TicketsRepository } from '@tickets/repository/ticket.repository';
import { MailService } from '@services/mail/mail.service';
import { GenerateQrCodeImageService } from '@services/generate-qrcode-image.service';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

describe('TicketEmailProcessor', () => {
 let processor: TicketEmailProcessor;
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

 const mockJob = {
  data: {
   ticketId: 'ticket-123',
   qrCodeToken: 'token-abc',
  },
 } as Job;

 const mockTicket = {
  id: 'ticket-123',
  user: {
   email: 'usuario@teste.com',
   username: 'João Silva',
  },
  ticketType: {
   name: 'VIP',
   event: {
    title: 'Festival de Música',
   },
  },
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    TicketEmailProcessor,
    { provide: TicketsRepository, useValue: mockTicketsRepository },
    { provide: GenerateQrCodeImageService, useValue: mockGenerateQrCodeImageService },
    { provide: MailService, useValue: mockMailService },
   ],
  }).compile();

  processor = module.get<TicketEmailProcessor>(TicketEmailProcessor);
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

 it('deve processar o job e enviar o e-mail com sucesso', async () => {
  const mockBuffer = Buffer.from('mock-qr-code');

  mockTicketsRepository.findByIdWithRelations.mockResolvedValue(mockTicket);
  mockGenerateQrCodeImageService.execute.mockResolvedValue(mockBuffer);
  mockMailService.sendTicketEmail.mockResolvedValue(true);

  await processor.process(mockJob);

  expect(ticketsRepository.findByIdWithRelations).toHaveBeenCalledWith('ticket-123');
  expect(generateQrCodeImageService.execute).toHaveBeenCalledWith('token-abc');
  expect(mailService.sendTicketEmail).toHaveBeenCalledWith(
   'usuario@teste.com',
   'João Silva',
   'Festival de Música',
   'VIP',
   mockBuffer,
  );
  expect(Logger.prototype.log).toHaveBeenCalledWith('Iniciando processamento do e-mail para o ticket ticket-123...');
  expect(Logger.prototype.log).toHaveBeenCalledWith('E-mail de confirmação enviado com sucesso para: usuario@teste.com');
 });

 it('deve abortar o processamento e logar aviso se o ticket não for encontrado', async () => {
  mockTicketsRepository.findByIdWithRelations.mockResolvedValue(null);

  await processor.process(mockJob);

  expect(Logger.prototype.warn).toHaveBeenCalledWith(
   'Tentativa de enviar e-mail para ticket inexistente ou sem e-mail: ticket-123',
  );
  expect(generateQrCodeImageService.execute).not.toHaveBeenCalled();
  expect(mailService.sendTicketEmail).not.toHaveBeenCalled();
 });

 it('deve abortar o processamento e logar aviso se o usuário não tiver e-mail', async () => {
  const ticketWithoutEmail = { ...mockTicket, user: { ...mockTicket.user, email: null } };
  mockTicketsRepository.findByIdWithRelations.mockResolvedValue(ticketWithoutEmail);

  await processor.process(mockJob);

  expect(Logger.prototype.warn).toHaveBeenCalledWith(
   'Tentativa de enviar e-mail para ticket inexistente ou sem e-mail: ticket-123',
  );
  expect(generateQrCodeImageService.execute).not.toHaveBeenCalled();
  expect(mailService.sendTicketEmail).not.toHaveBeenCalled();
 });

 it('deve repassar o erro e logar falha caso a geração do QR Code dê erro (Error instance)', async () => {
  const error = new Error('Falha no QR Code');
  mockTicketsRepository.findByIdWithRelations.mockResolvedValue(mockTicket);
  mockGenerateQrCodeImageService.execute.mockRejectedValue(error);

  await expect(processor.process(mockJob)).rejects.toThrow(error);

  expect(Logger.prototype.error).toHaveBeenCalledWith(
   'Falha no worker ao disparar e-mail do ticket ticket-123: Falha no QR Code',
  );
  expect(mailService.sendTicketEmail).not.toHaveBeenCalled();
 });

 it('deve repassar o erro e logar falha caso o disparo de e-mail falhe (Erro desconhecido)', async () => {
  const mockBuffer = Buffer.from('mock-qr-code');
  mockTicketsRepository.findByIdWithRelations.mockResolvedValue(mockTicket);
  mockGenerateQrCodeImageService.execute.mockResolvedValue(mockBuffer);

  mockMailService.sendTicketEmail.mockRejectedValue('String Error');

  await expect(processor.process(mockJob)).rejects.toEqual('String Error');

  expect(Logger.prototype.error).toHaveBeenCalledWith(
   'Falha no worker ao disparar e-mail do ticket ticket-123: Erro desconhecido ao disparar e-mail',
  );
 });
});