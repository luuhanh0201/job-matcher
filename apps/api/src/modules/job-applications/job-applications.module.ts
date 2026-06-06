import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from '@/modules/cv/entities/cv.entity';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { JobApplicationEntity } from './entities/job-application.entity';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsService } from './job-applications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplicationEntity, JobPostEntity, Cv]),
  ],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
})
export class JobApplicationsModule {}
