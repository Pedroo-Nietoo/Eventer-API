import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { StorageService } from '@infra/aws/s3/service/storage.service';

describe('UploadController', () => {
  let controller: UploadController;
  let storageService: StorageService;

  const mockStorageService = { generatePresignedUrl: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    storageService = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPresignedUrl', () => {
    it('deve chamar StorageService.generatePresignedUrl com os parâmetros corretos', async () => {
      const dto: any = {
        fileName: 'test-file.jpg',
        contentType: 'image/jpeg',
        folder: 'events'
      };
      const expectedResult: any = {
        presignedUrl: 'https://s3.amazonaws.com/presigned-url-mock',
        finalUrl: 'https://cloudfront.net/events/mock.jpg'
      };

      mockStorageService.generatePresignedUrl.mockResolvedValue(expectedResult);

      const result = await controller.getPresignedUrl(dto);

      expect(storageService.generatePresignedUrl).toHaveBeenCalledWith(
        dto.fileName,
        dto.contentType,
        dto.folder,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});