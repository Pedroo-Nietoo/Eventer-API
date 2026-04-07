import { Controller, Post, Body } from '@nestjs/common';
import { StorageService } from './storage.service';
import { GenerateUploadUrlDto } from '@common/dtos/generate-upload-url.dto';

@Controller('uploads')
export class UploadController {
 constructor(private readonly storageService: StorageService) { }

 @Post('presigned-url')
 async getPresignedUrl(@Body() body: GenerateUploadUrlDto) {
  return this.storageService.generatePresignedUrl(
   body.fileName,
   body.contentType,
   body.folder,
  );
 }
}