import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MatchResultsService } from '@/modules/match-results/match-results.service';
import { MATCHING_JOB_NAMES, MATCHING_QUEUE } from './matching-queue.constants';

/**
 * Worker xử lý AI matching ngoài request path. Concurrency 2: tối đa 2 việc
 * matching chạy song song toàn hệ thống (mỗi việc đã tự giới hạn số request AI),
 * tránh bùng nổ lượt gọi AI khi nhiều user upload CV cùng lúc.
 */
@Processor(MATCHING_QUEUE, { concurrency: 2 })
export class MatchingProcessor extends WorkerHost {
  private readonly logger = new Logger(MatchingProcessor.name);

  constructor(private readonly matchResultsService: MatchResultsService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case MATCHING_JOB_NAMES.MATCH_CV: {
        const { parsedCvId } = job.data as { parsedCvId: string };
        await this.matchResultsService.runMatchingForParsedCv(parsedCvId);
        return;
      }
      case MATCHING_JOB_NAMES.MATCH_NEW_JOB: {
        const { jobPostId } = job.data as { jobPostId: string };
        await this.matchResultsService.runMatchingForNewJob(jobPostId);
        return;
      }
      default:
        this.logger.warn(`Bỏ qua job không xác định trong queue: ${job.name}`);
    }
  }
}
