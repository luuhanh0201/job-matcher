// cv-processing.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CvQueueService } from './cv-queue/cv-queue.service';
import { CvWorkerService } from './cv-worker/cv-worker.service';
import { CvController } from './cv-processing.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'cv-processing',
    }),
  ],
  controllers: [CvController],
  providers: [CvQueueService, CvWorkerService],
  exports: [CvQueueService],
})
export class CvProcessingModule {}
