import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './service/cv.service';
import { PdfParserService } from './service/pdf-parser.service';

@Module({
  controllers: [CvController],
  providers: [CvService, PdfParserService],
  exports: [CvService, PdfParserService],
})
export class CvModule {}
