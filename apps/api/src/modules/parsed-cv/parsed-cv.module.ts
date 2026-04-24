import { Module } from '@nestjs/common';
import { ParsedCvService } from './parsed-cv.service';
import { ParsedCvController } from './parsed-cv.controller';

@Module({
  controllers: [ParsedCvController],
  providers: [ParsedCvService],
})
export class ParsedCvModule {}
