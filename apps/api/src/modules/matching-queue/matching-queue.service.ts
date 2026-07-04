import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  MATCHING_DEBOUNCE_MS,
  MATCHING_JOB_NAMES,
  MATCHING_QUEUE,
} from './matching-queue.constants';

/**
 * Producer: đẩy việc AI matching vào queue thay vì chạy fire-and-forget trong
 * request path. Lỗi enqueue (vd Redis down) chỉ log, không làm hỏng request gốc.
 */
@Injectable()
export class MatchingQueueService {
  private readonly logger = new Logger(MatchingQueueService.name);

  constructor(
    @InjectQueue(MATCHING_QUEUE) private readonly matchingQueue: Queue,
  ) {}

  async enqueueCvMatching(parsedCvId: string): Promise<void> {
    try {
      await this.matchingQueue.add(
        MATCHING_JOB_NAMES.MATCH_CV,
        { parsedCvId },
        {
          // BullMQ cấm ':' trong custom jobId
          jobId: `cv-${parsedCvId}`,
          delay: MATCHING_DEBOUNCE_MS,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    } catch (error) {
      this.logger.error(
        `Không thể enqueue matching cho parsedCv ${parsedCvId}`,
        error,
      );
    }
  }

  async enqueueNewJobMatching(jobPostId: string): Promise<void> {
    try {
      await this.matchingQueue.add(
        MATCHING_JOB_NAMES.MATCH_NEW_JOB,
        { jobPostId },
        {
          jobId: `job-${jobPostId}`,
          delay: MATCHING_DEBOUNCE_MS,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    } catch (error) {
      this.logger.error(
        `Không thể enqueue matching cho job ${jobPostId}`,
        error,
      );
    }
  }
}
