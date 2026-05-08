import { Controller, Get, Param, Post } from '@nestjs/common';
import { CvProcessingService } from './service/cv-processing.service';

@Controller('cv-processing')
export class CvProcessingController {
  constructor(private readonly cvProcessingService: CvProcessingService) {}

  @Post('test-processing')
  testProcessing(): { status: 'ok'; mode: 'db-processing' } {
    return {
      status: 'ok',
      mode: 'db-processing',
    };
  }

  @Get('cv/:cvId/status')
  getCvStatus(@Param('cvId') cvId: string): Promise<Record<string, unknown>> {
    return this.cvProcessingService.getCvStatus(cvId);
  }
}
