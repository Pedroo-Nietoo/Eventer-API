import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Public } from '@decorators/public.decorator';
import * as QRCode from 'qrcode';

/**
 * Service responsible for generating QR codes.
 */
@Injectable()
export class QrCodeService {
  /**
   * Generates a QR code for the given data.
   * @param data - The data to encode in the QR code.
   * @returns A promise that resolves to the QR code data URL.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
  async generateQrCode(data: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data);
      return qrCodeDataUrl;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate QR code',
        error,
      );
    }
  }
}
