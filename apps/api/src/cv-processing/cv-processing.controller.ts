import { Controller, Get, Param, Post } from '@nestjs/common';
import { CvQueueService } from './cv-queue/cv-queue.service';

@Controller('cv-processing')
export class CvController {
  constructor(private readonly cvQueueService: CvQueueService) {}

  @Post('test-redis')
  async testRedis() {
    return this.cvQueueService.testQueue();
  }

  @Get('jobs/:jobId/status')
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.cvQueueService.getJobStatus(jobId);
  }
}
