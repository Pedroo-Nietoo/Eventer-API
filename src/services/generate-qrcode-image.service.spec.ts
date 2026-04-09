import { Test, TestingModule } from '@nestjs/testing';
import * as QRCode from 'qrcode';
import { GenerateQrCodeImageService } from './generate-qrcode-image.service';

jest.mock('qrcode');

describe('GenerateQrCodeImageService', () => {
  let service: GenerateQrCodeImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerateQrCodeImageService],
    }).compile();

    service = module.get<GenerateQrCodeImageService>(GenerateQrCodeImageService);

    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const ticketToken = 'meu-token-seguro-123';
    const mockBuffer = Buffer.from('imagem-qr-code-fake');

    it('deve gerar o buffer do QR Code com as configurações corretas', async () => {
      (QRCode.toBuffer as jest.Mock).mockResolvedValue(mockBuffer);

      const result = await service.execute(ticketToken);

      expect(result).toBe(mockBuffer);
      expect(QRCode.toBuffer).toHaveBeenCalledWith(
        ticketToken,
        expect.objectContaining({
          errorCorrectionLevel: 'H',
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        })
      );
    });

    it('deve lançar um erro caso a biblioteca qrcode falhe', async () => {
      const qrError = new Error('Falha técnica na geração');
      (QRCode.toBuffer as jest.Mock).mockRejectedValue(qrError);

      await expect(service.execute(ticketToken)).rejects.toThrow(
        'Falha ao gerar a imagem do QR Code para o e-mail'
      );

      expect(console.error).toHaveBeenCalledWith('Erro ao gerar QR Code:', qrError);
    });
  });
});