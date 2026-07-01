import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchResultsService } from './match-results.service';
import { MatchResultsController } from './match-results.controller';
import { MatchResult } from './entities/match-result.entity';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { ParsedCv } from '@/modules/cv/entities/parsed-cv.entity';
import { AiModule } from '@/modules/ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchResult, JobPostEntity, ParsedCv]),
    AiModule,
  ],
  controllers: [MatchResultsController],
  providers: [MatchResultsService],
  exports: [MatchResultsService],
})
export class MatchResultsModule {}
