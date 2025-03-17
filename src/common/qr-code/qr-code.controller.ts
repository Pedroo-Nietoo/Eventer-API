import { Controller, Post, Body } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { Public } from '@src/modules/auth/decorators/public.decorator';

/**
 * QrCodeController handles all QR code-related HTTP requests.
 */
@Controller('qr-code')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  /**
   * Generates a QR code for the given data.
   * @param data - The data to encode in the QR code.
   * @returns The generated QR code data URL.
   */
  @Post()
  async generateQrCode(@Body('data') data: string): Promise<string> {
    return this.qrCodeService.generateQrCode(data);
  }
}
