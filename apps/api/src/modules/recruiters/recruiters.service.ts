import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RecruiterEntity } from './entity/recruiter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserRole } from '@/common/enum/index.enum';
import { CreateRecruiterProfileDto } from './dto/recruiters-profile.repository';
import { RecruiterResponseDto } from './dto/recruiter-response.dto';
import { MailService } from '../mail/mail.service';
import { UploadCloudinaryService } from '../upload-cloudinary/upload-cloudinary.service';
import { UpdateRecruiterProfileDto } from './dto/update-recruiter-profile.dto';

@Injectable()
export class RecruitersService {
  constructor(
    @InjectRepository(RecruiterEntity)
    private readonly recruiterRepository: Repository<RecruiterEntity>,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly cloudinaryService: UploadCloudinaryService,
  ) {}

  async createRecruiterProfile(
    id: string,
    createRecruiterProfileDto: CreateRecruiterProfileDto,
  ) {
    const result = await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const recruiterRepository = manager.getRepository(RecruiterEntity);

      const user = await userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      const existingProfile = await recruiterRepository.findOne({
        where: { userId: id },
      });
      if (existingProfile) {
        throw new ConflictException('Hồ sơ nhà tuyển dụng đã tồn tại');
      }

      if (user.role !== UserRole.RECRUITER) {
        user.role = UserRole.RECRUITER;
        await userRepository.save(user);
      }

      const profile = await recruiterRepository.save({
        userId: id,
        contactPhone: createRecruiterProfileDto.contactPhone,
        contactEmail: createRecruiterProfileDto.contactEmail ?? user.email,
      });

      return {
        profile,
        notifyEmail: profile.contactEmail ?? user.email,
        userName: user.fullName,
      };
    });

    await this.mailService.sendRecruiterRegistrationSuccessEmail(
      result.notifyEmail,
      result.userName,
    );

    return result.profile;
  }

  async getRecruiterProfile(userId: string): Promise<RecruiterResponseDto> {
    console.log('Getting recruiter profile for userId:', userId);
    const profile = await this.recruiterRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException('Hồ sơ nhà tuyển dụng không tồn tại');
    }
    return {
      id: profile.id,
      fullName: profile.user.fullName,
      email: profile.user.email,
      avatar: profile.user.avatar ?? null,
      contactPhone: profile.contactPhone as string,
      contactEmail: profile.contactEmail,
      isVerified: profile.isVerified,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async updateRecruiterAvatar(
    userId: string,
    avatar: Express.Multer.File,
  ): Promise<RecruiterResponseDto> {
    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const uploadResult = await this.cloudinaryService.uploadImage(avatar);
    user.avatar = uploadResult.secure_url;
    await userRepository.save(user);

    return this.getRecruiterProfile(userId);
  }

  async updateRecruiterProfile(
    userId: string,
    updateRecruiterProfileDto: UpdateRecruiterProfileDto,
  ): Promise<RecruiterResponseDto> {
    await this.dataSource.transaction(async (manager) => {
      const recruiterRepository = manager.getRepository(RecruiterEntity);
      const userRepository = manager.getRepository(User);

      const profile = await recruiterRepository.findOne({ where: { userId } });
      if (!profile) {
        throw new NotFoundException('Hồ sơ nhà tuyển dụng không tồn tại');
      }

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      if (updateRecruiterProfileDto.fullName) {
        user.fullName = updateRecruiterProfileDto.fullName;
      }

      if (updateRecruiterProfileDto.contactEmail !== undefined) {
        profile.contactEmail = updateRecruiterProfileDto.contactEmail;
      }

      if (updateRecruiterProfileDto.contactPhone !== undefined) {
        profile.contactPhone = updateRecruiterProfileDto.contactPhone;
      }

      await userRepository.save(user);
      await recruiterRepository.save(profile);
    });

    return this.getRecruiterProfile(userId);
  }
}
