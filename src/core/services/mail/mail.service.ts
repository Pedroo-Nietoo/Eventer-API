import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as handlebars from 'handlebars';
import puppeteer from 'puppeteer';

@Injectable()
export class MailService {
 private readonly resend: Resend;
 private readonly logger = new Logger(MailService.name);

 constructor(private readonly configService: ConfigService) {
  const apiKey = this.configService.get<string>('RESEND_API_KEY');
  this.resend = new Resend(apiKey);
 }

 async sendTicketEmail(to: string, userName: string, eventName: string, qrCodeBuffer: Buffer) {
  try {
   const ticketTemplatePath = path.join(__dirname, 'templates', 'ticket.hbs');
   const pdfTemplatePath = path.join(__dirname, 'templates', 'pdf.hbs');

   const [ticketTemplateFile, pdfTemplateFile] = await Promise.all([
    fs.readFile(ticketTemplatePath, 'utf8'),
    fs.readFile(pdfTemplatePath, 'utf8')
   ]);

   const compiledTicket = handlebars.compile(ticketTemplateFile);
   const compiledPdf = handlebars.compile(pdfTemplateFile);

   const emailHtml = compiledTicket({
    userName,
    eventName,
    qrCodeUrl: 'cid:qrcode-ingresso',
   });

   const qrCodeBase64 = `data:image/png;base64,${qrCodeBuffer.toString('base64')}`;
   const pdfHtml = compiledPdf({
    userName,
    eventName,
    qrCodeUrl: qrCodeBase64,
   });

   const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
   });
   const page = await browser.newPage();

   await page.setContent(pdfHtml, { waitUntil: 'networkidle0' });

   const pdfUint8Array = await page.pdf({
    format: 'A4',
    printBackground: true
   });

   const pdfBuffer = Buffer.from(pdfUint8Array);

   await browser.close();

   const { data, error } = await this.resend.emails.send({
    from: 'Ingressos API <onboarding@resend.dev>',
    to: [to],
    subject: `🎟️ Seu ingresso para ${eventName} está aqui!`,
    html: emailHtml,
    attachments: [
     {
      filename: 'ingresso-inline.png',
      content: qrCodeBuffer,
      contentId: 'qrcode-ingresso',
     },
     {
      filename: 'Ingresso_Oficial.pdf',
      content: pdfBuffer,
     },
    ],
   });

   if (error) {
    throw new Error(error.message);
   }

   this.logger.log(`E-mail com anexo em PDF enviado com sucesso! ID: ${data?.id}`);
   return true;

  } catch (error) {
   this.logger.error(`Falha ao enviar e-mail com PDF para ${to}: ${error.message}`);
   throw new InternalServerErrorException('Não foi possível enviar o ingresso.');
  }
 }
}