import * as QRCode from 'qrcode';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateQrCodeImageService {

 async execute(ticketToken: string): Promise<Buffer> {
  try {
   const imageBuffer = await QRCode.toBuffer(ticketToken, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
   });

   return imageBuffer;
  } catch (error) {
   throw new Error('Falha ao gerar a imagem do QR Code para o e-mail');
  }
 }
}