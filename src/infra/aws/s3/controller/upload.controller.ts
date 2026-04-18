import { Controller, Post, Body } from '@nestjs/common';
import { GenerateUploadUrlDto } from '@common/dtos/generate-upload-url.dto';
import { SwaggerUploadController as Doc } from './upload.swagger';
import { StorageService } from '@infra/aws/s3/service/storage.service';

@Doc.Main()
@Controller('uploads')
export class UploadController {
  constructor(private readonly storageService: StorageService) { }

  @Doc.GetPresignedUrl()
  @Post('presigned-url')
  async getPresignedUrl(@Body() body: GenerateUploadUrlDto) {
    return this.storageService.generatePresignedUrl(
      body.fileName,
      body.contentType,
      body.folder,
    );
  }
}