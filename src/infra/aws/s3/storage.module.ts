import { Module } from '@nestjs/common';
import { StorageService } from './service/storage.service';
import { UploadController } from './controller/upload.controller';

@Module({
  controllers: [UploadController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule { }
