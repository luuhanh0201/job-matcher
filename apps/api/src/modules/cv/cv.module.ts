import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './service/cv.service';
import { PdfParserService } from './service/pdf-parser.service';
import { UploadCloudinaryModule } from '../upload-cloudinary/upload-cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { TextPreprocessorService } from '@/cv-processing/service/text-preprocessor.service';
import { ParsedCv } from './entities/parsed-cv.entity';

@Module({
  imports: [UploadCloudinaryModule, TypeOrmModule.forFeature([Cv, ParsedCv])],
  controllers: [CvController],
  providers: [CvService, PdfParserService, TextPreprocessorService],
  exports: [CvService, PdfParserService, TextPreprocessorService],
})
export class CvModule {}
