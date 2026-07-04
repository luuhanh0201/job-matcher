import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MatchResultsModule } from '@/modules/match-results/match-results.module';
import { MATCHING_QUEUE } from './matching-queue.constants';
import { MatchingProcessor } from './matching.processor';
import { MatchingQueueService } from './matching-queue.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: MATCHING_QUEUE }),
    MatchResultsModule,
  ],
  providers: [MatchingQueueService, MatchingProcessor],
  exports: [MatchingQueueService],
})
export class MatchingQueueModule {}
