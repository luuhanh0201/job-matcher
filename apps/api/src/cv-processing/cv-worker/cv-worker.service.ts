import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
interface CvProcessingJobData {
  cvDocumentId: string;
}
@Processor('cv-processing')
export class CvWorkerService extends WorkerHost {
  constructor() {
    super();
  }
  async process(job: Job<CvProcessingJobData>) {
    const { cvDocumentId } = job.data;

    // const cv = await this.cvRepository.findOne(cvDocumentId);
    await job.updateProgress(10);

    // const rawText = extractedText;
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
