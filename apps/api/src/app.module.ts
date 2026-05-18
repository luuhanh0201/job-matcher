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
    JobsModule,
    UserModule,
    CvModule,
    MatchResultsModule,
    UploadCloudinaryModule,
    AuthModule,
    AiModule,
    ActiveLogModule,
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
