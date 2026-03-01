import * as QRCode from 'qrcode';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateQrCodeImageService {

 // Retorna um Buffer que pode ser anexado diretamente no Nodemailer ou AWS SES
 async execute(ticketToken: string): Promise<Buffer> {
  try {
   // Gera a imagem do QR code em formato PNG como um Buffer
   const imageBuffer = await QRCode.toBuffer(ticketToken, {
    errorCorrectionLevel: 'H', // Alta correção de erro (lê mesmo se a imagem estiver um pouco danificada)
    width: 300,
    margin: 2,
   });

   return imageBuffer;
  } catch (error) {
   throw new Error('Falha ao gerar a imagem do QR Code para o e-mail');
  }
 }
}