import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { SavedJobEntity } from './entities/saved-job.entity';
import { SavedJobsController } from './saved-jobs.controller';
import { SavedJobsService } from './saved-jobs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedJobEntity, JobPostEntity]),
    JobsModule,
  ],
  controllers: [SavedJobsController],
  providers: [SavedJobsService],
})
export class SavedJobsModule {}
