import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'node:path';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cloudFrontUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME')!;

    this.cloudFrontUrl = this.configService.get<string>('AWS_CLOUDFRONT_URL')!;

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION')!,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!,
      },
    });
  }

  async generatePresignedUrl(
    fileName: string,
    contentType: string,
    folder: 'users' | 'events',
  ) {
    try {
      const extension = path.extname(fileName);
      const uniqueFileName = `${folder}/${uuidv4()}${extension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueFileName,
        ContentType: contentType,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300,
      });

      const cleanCloudFrontUrl = this.cloudFrontUrl.replace(/\/$/, '');
      const finalUrl = `${cleanCloudFrontUrl}/${uniqueFileName}`;

      return {
        presignedUrl,
        finalUrl,
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new InternalServerErrorException(
        'Erro ao gerar URL de upload temporária',
      );
    }
  }
}
