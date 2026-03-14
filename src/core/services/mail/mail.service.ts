import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as handlebars from 'handlebars';

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
   const templatePath = path.join(__dirname, 'templates', 'ticket.hbs');

   const templateFile = await fs.readFile(templatePath, 'utf8');
   const compiledTemplate = handlebars.compile(templateFile);

   const htmlContent = compiledTemplate({
    userName,
    eventName,
   });

   const { data, error } = await this.resend.emails.send({
    from: 'Ingressos API <onboarding@resend.dev>',
    to: [to],
    subject: `🎟️ Seu ingresso para ${eventName} está aqui!`,
    html: htmlContent,
    attachments: [
     {
      filename: 'ingresso.png',
      content: qrCodeBuffer,
      contentId: 'qrcode-ingresso',
     },
    ],
   });

   if (error) {
    throw new Error(error.message);
   }

   this.logger.log(`E-mail enviado com sucesso! ID: ${data?.id}`);
   return true;

  } catch (error) {
   this.logger.error(`Falha ao enviar e-mail com template para ${to}: ${error.message}`);
   throw new InternalServerErrorException('Não foi possível enviar o ingresso.');
  }
 }
}