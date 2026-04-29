import * as QRCode from 'qrcode';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateQrCodeImageService {
  async execute(ticketToken: string): Promise<Buffer> {
    return QRCode.toBuffer(ticketToken, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  }
}
