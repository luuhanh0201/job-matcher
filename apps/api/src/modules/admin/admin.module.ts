import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiUsageLogEntity } from '@/modules/ai-usage/entities/ai-usage-log.entity';
import { JobApplicationEntity } from '@/modules/job-applications/entities/job-application.entity';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { JobsModule } from '@/modules/jobs/jobs.module';
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
    ]),
    JobsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
