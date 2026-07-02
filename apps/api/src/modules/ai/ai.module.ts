import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { AiProvidersModule } from '@/modules/ai-providers/ai-providers.module';
import { AiUsageModule } from '@/modules/ai-usage/ai-usage.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiExtractorService } from './ai-extractor.service';
import { AiAnalyzerService } from './ai-analyzer.service';
import { AiJobMatcherService } from './ai-job-matcher.service';
import { AiAdaptersModule } from './adapters/ai-adapters.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: 24 * 60 * 60 * 1000,
      max: 1000,
    }),
    AiProvidersModule,
    AiUsageModule,
    AiAdaptersModule,
  ],
  providers: [
    AiService,
    AiExtractorService,
    AiAnalyzerService,
    AiJobMatcherService,
  ],
  exports: [
    AiService,
    AiExtractorService,
    AiAnalyzerService,
    AiJobMatcherService,
  ],
  controllers: [AiController],
})
export class AiModule {}
