// cv-processing.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from '@/modules/cv/entities/cv.entity';
import { ParsedCv } from '@/modules/cv/entities/parsed-cv.entity';
import { PdfParserService } from '@/modules/cv/service/pdf-parser.service';
import { CvProcessingService } from './service/cv-processing.service';
import { TextPreprocessorService } from './service/text-preprocessor.service';
import { CvProcessingController } from './cv-processing.controller';

export const CV_PROCESSING_SERVICE_TOKEN = 'CV_PROCESSING_SERVICE_TOKEN';

@Module({
  imports: [TypeOrmModule.forFeature([Cv, ParsedCv])],
  controllers: [CvProcessingController],
  providers: [
    CvProcessingService,
    PdfParserService,
    TextPreprocessorService,
    {
      provide: CV_PROCESSING_SERVICE_TOKEN,
      useExisting: CvProcessingService,
    },
  ],
  exports: [CvProcessingService, CV_PROCESSING_SERVICE_TOKEN],
})
export class CvProcessingModule {}
