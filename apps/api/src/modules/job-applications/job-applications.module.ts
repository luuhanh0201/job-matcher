import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from '@/modules/cv/entities/cv.entity';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { MailModule } from '@/modules/mail/mail.module';
import { JobApplicationEntity } from './entities/job-application.entity';
import { JobApplicationStatusLogEntity } from './entities/job-application-status-log.entity';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsService } from './job-applications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobApplicationEntity,
      JobApplicationStatusLogEntity,
      JobPostEntity,
      Cv,
    ]),
    MailModule,
  ],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
})
export class JobApplicationsModule {}
