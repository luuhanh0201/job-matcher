import { InternalServerErrorException, Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiExtractorService } from './ai-extractor.service';
import { AiAnalyzerService } from './ai-analyzer.service';
import { join } from 'path/win32';
import { readFileSync } from 'fs';

@Module({
  providers: [AiService, AiExtractorService, AiAnalyzerService],
  exports: [AiService, AiExtractorService, AiAnalyzerService],
  controllers: [AiController],
})
export class AiModule { 


}
