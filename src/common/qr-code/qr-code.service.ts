import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Public } from '@decorators/public.decorator';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

/**
 * Service responsible for generating QR codes.
 */
@Injectable()
export class QrCodeService {

  /**
   * Constructs an instance of the QrCodeService.
   * 
   * @param configService - The configuration service used to access application settings.
   */
  constructor(
    private readonly configService: ConfigService,
  ) { }

  /**
   * Generates a QR code for the given data.
   * @param data - The data to encode in the QR code.
   * @returns A promise that resolves to the QR code data URL.
   * @throws {InternalServerErrorException} if an error occurs during the operation.
   */
  async generateQrCode(ticketId: string): Promise<string> {
    try {
      const qrCodeURL = `${this.configService.get<string>('BASE_ENVIRONMENT')}/tickets/${ticketId}/mark-as-used`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeURL);
      return qrCodeDataUrl;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate QR code',
        error,
      );
    }
  }
}
