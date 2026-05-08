import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './service/cv.service';
import { PdfParserService } from './service/pdf-parser.service';
import { UploadCloudinaryModule } from '../upload-cloudinary/upload-cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { TextPreprocessorService } from '@/cv-processing/service/text-preprocessor.service';
import { ParsedCv } from './entities/parsed-cv.entity';
import { CvProcessingModule } from '@/cv-processing/cv-processing.module';

@Module({
  imports: [
    UploadCloudinaryModule,
    TypeOrmModule.forFeature([Cv, ParsedCv]),
    CvProcessingModule,
  ],
  controllers: [CvController],
  providers: [CvService, PdfParserService, TextPreprocessorService],
  exports: [CvService, PdfParserService, TextPreprocessorService],
})
export class CvModule {}
