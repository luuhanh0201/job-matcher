import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplicationEntity } from '@/modules/job-applications/entities/job-application.entity';
import { MailModule } from '@/modules/mail/mail.module';
import { InterviewEntity } from './entities/interview.entity';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InterviewEntity, JobApplicationEntity]),
    MailModule,
  ],
  controllers: [InterviewsController],
  providers: [InterviewsService],
})
export class InterviewsModule {}
