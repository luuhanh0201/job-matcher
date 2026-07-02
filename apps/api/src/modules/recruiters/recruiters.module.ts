import { Module } from '@nestjs/common';
import { RecruitersService } from './recruiters.service';
import { RecruitersController } from './recruiters.controller';
import { RecruiterEntity } from './entity/recruiter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { UploadCloudinaryModule } from '../upload-cloudinary/upload-cloudinary.module';

@Module({
  imports: [
    UserModule,
    MailModule,
    UploadCloudinaryModule,
    TypeOrmModule.forFeature([RecruiterEntity]),
  ],
  controllers: [RecruitersController],
  providers: [RecruitersService],
  exports: [RecruitersService],
})
export class RecruitersModule {}
