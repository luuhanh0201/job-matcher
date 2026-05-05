import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class CvQueueService {
  constructor(@InjectQueue('cv-processing') private readonly cvQueue: Queue) {}

  async testQueue() {
    const client = await this.cvQueue.client;
    const pong = await client.ping();
    const job = await this.cvQueue.add('test', { hello: 'world' });
    console.log('Job added:', job.id);

    return {
      pong,
      queueName: this.cvQueue.name,
      jobId: job.id,
    };
  }

  async addCvProcessingJob(cvDocumentId: string) {
    const job = await this.cvQueue.add('process-cv', { cvDocumentId });
    console.log(
      `Added CV processing job for CV ID ${cvDocumentId} with job ID ${job.id}`,
    );
    return {
      jobId: job.id,
      status: 'queued',
    };
  }
  async getJobStatus(jobId: string) {
    const job = await this.cvQueue.getJob(jobId);
    if (!job) {
      return { status: 'not found' };
    }
    return job;
  }
}
