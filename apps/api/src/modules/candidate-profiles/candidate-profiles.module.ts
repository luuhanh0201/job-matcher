import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { CandidateProfilesController } from './candidate-profiles.controller';
import { CandidateProfilesService } from './candidate-profiles.service';
import { CandidateProfileEntity } from './entities/candidate-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateProfileEntity, User])],
  controllers: [CandidateProfilesController],
  providers: [CandidateProfilesService],
})
export class CandidateProfilesModule {}
