import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { InternalServerErrorException } from '@nestjs/common';
import * as uuid from 'uuid';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('uuid');

describe('StorageService', () => {
 let service: StorageService;
 let configService: ConfigService;

 const mockEnvConfig: Record<string, string> = {
  AWS_S3_BUCKET_NAME: 'eventer-api-bucket',
  AWS_CLOUDFRONT_URL: 'https://cdn.eventerapi.com/',
  AWS_REGION: 'us-east-1',
  AWS_ACCESS_KEY_ID: 'fake-access-key',
  AWS_SECRET_ACCESS_KEY: 'fake-secret-key',
 };

 const mockConfigService = {
  get: jest.fn((key: string) => mockEnvConfig[key]),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    StorageService,
    {
     provide: ConfigService,
     useValue: mockConfigService,
    },
   ],
  }).compile();

  service = module.get<StorageService>(StorageService);
  configService = module.get<ConfigService>(ConfigService);

  jest.spyOn(console, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(service).toBeDefined();
 });

 describe('generatePresignedUrl', () => {
  const fileName = 'foto-perfil.jpeg';
  const contentType = 'image/jpeg';
  const folder = 'users';
  const fakeUuid = '1234abcd-5678-efgh';
  const fakePresignedUrl = 'https://s3.amazonaws.com/presigned-token-xyz';

  it('deve gerar a presigned URL e a URL final do CloudFront corretamente', async () => {
   (uuid.v4 as jest.Mock).mockReturnValue(fakeUuid);
   (getSignedUrl as jest.Mock).mockResolvedValue(fakePresignedUrl);

   const result = await service.generatePresignedUrl(fileName, contentType, folder);

   expect(uuid.v4).toHaveBeenCalled();

   expect(result.finalUrl).toBe(`https://cdn.eventerapi.com/users/${fakeUuid}.jpeg`);
   expect(result.presignedUrl).toBe(fakePresignedUrl);

   expect(getSignedUrl).toHaveBeenCalledWith(
    expect.any(S3Client),
    expect.any(PutObjectCommand),
    { expiresIn: 300 }
   );
  });

  it('deve formatar corretamente a URL se o CloudFront não tiver barra no final', async () => {
   mockEnvConfig['AWS_CLOUDFRONT_URL'] = 'https://cdn.eventerapi.com';

   const newService = new StorageService(configService);

   (uuid.v4 as jest.Mock).mockReturnValue(fakeUuid);
   (getSignedUrl as jest.Mock).mockResolvedValue(fakePresignedUrl);

   const result = await newService.generatePresignedUrl('banner.png', 'image/png', 'events');

   expect(result.finalUrl).toBe(`https://cdn.eventerapi.com/events/${fakeUuid}.png`);

   mockEnvConfig['AWS_CLOUDFRONT_URL'] = 'https://cdn.eventerapi.com/';
  });

  it('deve capturar erros do SDK da AWS e lançar InternalServerErrorException', async () => {
   const awsError = new Error('CredentialsError: Missing AWS access key');
   (getSignedUrl as jest.Mock).mockRejectedValue(awsError);

   await expect(
    service.generatePresignedUrl(fileName, contentType, folder)
   ).rejects.toThrow(InternalServerErrorException);

   expect(console.error).toHaveBeenCalledWith('Error generating presigned URL:', awsError);
  });
 });
});