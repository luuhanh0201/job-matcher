import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiExtractorService } from './ai-extractor.service';
import { AiAnalyzerService } from './ai-analyzer.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 24 * 60 * 60 * 1000,
      max: 1000,
    }),
  ],
  providers: [AiService, AiExtractorService, AiAnalyzerService],
  exports: [AiService, AiExtractorService, AiAnalyzerService],
  controllers: [AiController],
})
export class AiModule { }
