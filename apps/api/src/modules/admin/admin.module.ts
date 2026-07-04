import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiUsageLogEntity } from '@/modules/ai-usage/entities/ai-usage-log.entity';
import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { JobApplicationEntity } from '@/modules/job-applications/entities/job-application.entity';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { MailModule } from '@/modules/mail/mail.module';
import { MatchingQueueModule } from '@/modules/matching-queue/matching-queue.module';
import { RecruiterEntity } from '@/modules/recruiters/entity/recruiter.entity';
import { User } from '@/modules/user/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      JobPostEntity,
      JobApplicationEntity,
      AiUsageLogEntity,
      CompanyEntity,
      RecruiterEntity,
    ]),
    JobsModule,
    MailModule,
    MatchingQueueModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
