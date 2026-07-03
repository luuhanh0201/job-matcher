import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { Module } from '@nestjs/common';
import { JobsController } from '@/modules/jobs/jobs.controller';
import { JobsService } from '@/modules/jobs/jobs.service';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../company/entity/company.entity';

@Module({
  controllers: [JobsController],
  providers: [JobsService],
  imports: [TypeOrmModule.forFeature([JobPostEntity, User, CompanyEntity])],
  exports: [JobsService],
})
export class JobsModule {}
