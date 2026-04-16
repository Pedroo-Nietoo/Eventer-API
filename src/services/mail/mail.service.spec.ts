import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import * as fs from 'node:fs/promises';
import * as handlebars from 'handlebars';
import puppeteer from 'puppeteer';

jest.mock('resend');
jest.mock('fs/promises');
jest.mock('handlebars');
jest.mock('puppeteer');

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('re_123456789'),
  };

  const mockPdfBuffer = new Uint8Array([1, 2, 3]);
  const mockPage = {
    setContent: jest.fn().mockResolvedValue(undefined),
    pdf: jest.fn().mockResolvedValue(mockPdfBuffer),
  };
  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);

    (fs.readFile as jest.Mock).mockResolvedValue('<html>{{userName}}</html>');
    (handlebars.compile as jest.Mock).mockReturnValue(() => 'compiled-html');
    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('sendTicketEmail', () => {
    const emailParams = {
      to: 'cliente@test.com',
      userName: 'Pedro Nieto',
      eventName: 'Dev Conference',
      ticketType: 'VIP',
      qrCodeBuffer: Buffer.from('fake-qr-code'),
    };

    it('deve processar o PDF e enviar o e-mail com sucesso', async () => {
      const sendMock = jest.fn().mockResolvedValue({ data: { id: 'email-id' }, error: null });
      (Resend as jest.Mock).mockImplementation(() => ({
        emails: { send: sendMock },
      }));

      const newService = new MailService(configService);

      const result = await newService.sendTicketEmail(
        emailParams.to,
        emailParams.userName,
        emailParams.eventName,
        emailParams.ticketType,
        emailParams.qrCodeBuffer
      );

      expect(result).toBe(true);
      expect(fs.readFile).toHaveBeenCalledTimes(2);
      expect(puppeteer.launch).toHaveBeenCalled();
      expect(mockPage.setContent).toHaveBeenCalledWith('compiled-html', { waitUntil: 'networkidle0' });
      expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
        to: [emailParams.to],
        subject: expect.stringContaining(emailParams.eventName),
        attachments: expect.arrayContaining([
          expect.objectContaining({ filename: 'ingresso_evento.pdf' }),
          expect.objectContaining({ filename: 'ingresso-inline.png' }),
        ]),
      }));
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se o provedor de e-mail retornar erro', async () => {
      const sendMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'API Error' } });
      (Resend as jest.Mock).mockImplementation(() => ({
        emails: { send: sendMock },
      }));
      const newService = new MailService(configService);

      await expect(
        newService.sendTicketEmail(
          emailParams.to,
          emailParams.userName,
          emailParams.eventName,
          emailParams.ticketType,
          emailParams.qrCodeBuffer
        )
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('deve lançar InternalServerErrorException se a geração do PDF falhar', async () => {
      (puppeteer.launch as jest.Mock).mockRejectedValueOnce(new Error('Chromium crash'));

      await expect(
        service.sendTicketEmail(
          emailParams.to,
          emailParams.userName,
          emailParams.eventName,
          emailParams.ticketType,
          emailParams.qrCodeBuffer
        )
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});