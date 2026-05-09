import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiExtractorService } from './ai-extractor.service';

@Module({
  providers: [AiService, AiExtractorService],
  exports: [AiService, AiExtractorService],
  controllers: [AiController],
})
export class AiModule { }
