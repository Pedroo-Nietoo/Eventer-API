import { Test, TestingModule } from '@nestjs/testing';
import { GenerateQrCodeImageService } from './generate-qrcode-image.service';

describe('GenerateQrCodeImageService', () => {
  let service: GenerateQrCodeImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerateQrCodeImageService],
    }).compile();

    service = module.get<GenerateQrCodeImageService>(GenerateQrCodeImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
