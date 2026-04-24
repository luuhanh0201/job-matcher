import { Module } from '@nestjs/common';
import { JobsController } from '@/modules/jobs/jobs.controller';
import { JobsService } from '@/modules/jobs/jobs.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
