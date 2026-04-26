import { Module } from '@nestjs/common';
import { UploadCloudinaryService } from './upload-cloudinary.service';
import { UploadCloudinaryController } from './upload-cloudinary.controller';
import { cloudinaryConfig } from './upload-cloudinary.config';

@Module({
  controllers: [UploadCloudinaryController],
  providers: [UploadCloudinaryService, cloudinaryConfig],
  exports: [UploadCloudinaryService],
})
export class UploadCloudinaryModule {}
