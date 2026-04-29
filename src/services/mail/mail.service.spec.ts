import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException, Logger } from '@nestjs/common';
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
  let sendMock: jest.Mock;

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
    sendMock = jest.fn();
    (Resend as jest.Mock).mockImplementation(() => ({
      emails: { send: sendMock },
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);

    (fs.readFile as jest.Mock).mockResolvedValue('<html><body>{{userName}}</body></html>');
    (handlebars.compile as jest.Mock).mockReturnValue(() => 'compiled-html');
    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      sendMock.mockResolvedValue({ data: { id: 'email-id' }, error: null });

      const result = await service.sendTicketEmail(
        emailParams.to,
        emailParams.userName,
        emailParams.eventName,
        emailParams.ticketType,
        emailParams.qrCodeBuffer
      );

      expect(result).toBe(true);
      expect(fs.readFile).toHaveBeenCalledTimes(2);
      expect(mockBrowser.close).toHaveBeenCalled();
      expect(sendMock).toHaveBeenCalled();
    });

    it('deve garantir que o browser seja fechado mesmo se a geração do PDF falhar', async () => {
      mockPage.setContent.mockRejectedValueOnce(new Error('Page Error'));

      await expect(
        service.sendTicketEmail(
          emailParams.to,
          emailParams.userName,
          emailParams.eventName,
          emailParams.ticketType,
          emailParams.qrCodeBuffer
        )
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockBrowser.close).toHaveBeenCalled();
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('deve falhar se o provedor de e-mail retornar erro', async () => {
      sendMock.mockResolvedValue({ data: null, error: { message: 'Resend API Error' } });

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

    it('deve lançar erro se a leitura de templates falhar', async () => {
      (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('File not found'));

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