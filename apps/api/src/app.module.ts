import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { getDatabaseConfig } from '@/config/database.config';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { UserModule } from '@/modules/user/user.module';
import { CvModule } from './modules/cv/cv.module';
import { ParsedCvModule } from './modules/parsed-cv/parsed-cv.module';
import { MatchResultsModule } from './modules/match-results/match-results.module';

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
    JobsModule,
    UserModule,
    CvModule,
    ParsedCvModule,
    MatchResultsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
