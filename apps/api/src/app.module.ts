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
import { CvProcessingModule } from './cv-processing/cv-processing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    BullModule.forRoot({
      connection: {
        username: process.env.REDIS_CLOUD_USERNAME || '',
        host:
          process.env.REDIS_CLOUD_HOST || process.env.REDIS_HOST || 'localhost',
        port: parseInt(
          process.env.REDIS_CLOUD_PORT || process.env.REDIS_PORT || '15982',
          10,
        ),
        password:
          process.env.REDIS_CLOUD_PASSWORD || process.env.REDIS_PASSWORD,
      },
    }),
    JobsModule,
    UserModule,
    CvModule,
    MatchResultsModule,
    UploadCloudinaryModule,
    AuthModule,
    CvProcessingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(LoggingMiddleware).forRoutes({
  //     path: '/jobs',
  //     method: RequestMethod.ALL,
  //   });
  // }
}
