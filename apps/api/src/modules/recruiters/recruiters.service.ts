import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RecruiterEntity } from './entity/recruiter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserRole } from '@/common/enum/index.enum';
import { CreateRecruiterProfileDto } from './dto/recruiters-profile.repository';
import { RecruiterResponseDto } from './dto/recruiter-response.dto';

@Injectable()
export class RecruitersService {
  constructor(
    @InjectRepository(RecruiterEntity)
    private readonly recruiterRepository: Repository<RecruiterEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createRecruiterProfile(
    id: string,
    createRecruiterProfileDto: CreateRecruiterProfileDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const recruiterRepository = manager.getRepository(RecruiterEntity);

      const user = await userRepository.findOne({ where: { id } });
      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
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

      return recruiterRepository.save({
        userId: id,
        contactPhone: createRecruiterProfileDto.contactPhone,
        contactEmail: createRecruiterProfileDto.contactEmail ?? user.email,
      });
    });
  }

  async getRecruiterProfile(userId: string): Promise<RecruiterResponseDto> {
    console.log('Getting recruiter profile for userId:', userId);
    const profile = await this.recruiterRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!profile) {
      throw new UnauthorizedException('Hồ sơ nhà tuyển dụng không tồn tại');
    }
    return {
      id: profile.id,
      fullName: profile.user.fullName,
      email: profile.user.email,
      contactPhone: profile.contactPhone as string,
      contactEmail: profile.contactEmail,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
