import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { getDatabaseConfig } from '@/config/database.config';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { UserModule } from '@/modules/user/user.module';
import { CvModule } from './modules/cv/cv.module';
import { MatchResultsModule } from './modules/match-results/match-results.module';
import { UploadCloudinaryModule } from './modules/upload-cloudinary/upload-cloudinary.module';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';
import { ActiveLogModule } from './modules/active-log/active-log.module';
import { envFilePath } from 'typeorm.config';
import { MailModule } from './modules/mail/mail.module';
import { HealthController } from './health/health.controller';
import { RecruitersModule } from './modules/recruiters/recruiters.module';
import { CompanyModule } from './modules/company/company.module';
import { LocationModule } from './modules/location/location.module';
import { JobApplicationsModule } from './modules/job-applications/job-applications.module';
import { CandidateProfilesModule } from './modules/candidate-profiles/candidate-profiles.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { AiProvidersModule } from './modules/ai-providers/ai-providers.module';
import { AiUsageModule } from './modules/ai-usage/ai-usage.module';
import { SavedJobsModule } from './modules/saved-jobs/saved-jobs.module';
import { AdminModule } from './modules/admin/admin.module';
import { DatabasePrerequisitesService } from './config/database-prerequisites.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePath,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: parseInt(config.get<string>('REDIS_PORT', '6379'), 10),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    JobsModule,
    SavedJobsModule,
    AdminModule,
    UserModule,
    CvModule,
    MatchResultsModule,
    UploadCloudinaryModule,
    AuthModule,
    AiModule,
    ActiveLogModule,
    MailModule,
    RecruitersModule,
    CompanyModule,
    LocationModule,
    JobApplicationsModule,
    CandidateProfilesModule,
    InterviewsModule,
    AiProvidersModule,
    AiUsageModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, DatabasePrerequisitesService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(LoggingMiddleware).forRoutes({
  //     path: '/jobs',
  //     method: RequestMethod.ALL,
  //   });
  // }
}
