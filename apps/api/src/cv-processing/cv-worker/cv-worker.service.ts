import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
interface CvProcessingJobData {
  cvDocumentId: string;
}
@Processor('cv-processing')
export class CvWorkerService extends WorkerHost {
  async process(job: Job<CvProcessingJobData>) {
    const { cvDocumentId } = job.data;

    await job.updateProgress(10);

    // Parse PDF
    await job.updateProgress(50);

    // Preprocess text
    await job.updateProgress(80);

    return {
      cvDocumentId,
      status: 'completed',
    };
  }
}
