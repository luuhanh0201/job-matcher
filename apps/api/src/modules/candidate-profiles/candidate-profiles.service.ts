import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@/common/enum/index.enum';
import { User } from '@/modules/user/entities/user.entity';
import { JobApplicationEntity } from '@/modules/job-applications/entities/job-application.entity';
import { UploadCloudinaryService } from '@/modules/upload-cloudinary/upload-cloudinary.service';
import { CandidateProfileResponseDto } from './dto/candidate-profile-response.dto';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';
import { CandidateProfileEntity } from './entities/candidate-profile.entity';

@Injectable()
export class CandidateProfilesService {
  constructor(
    @InjectRepository(CandidateProfileEntity)
    private readonly candidateProfileRepository: Repository<CandidateProfileEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(JobApplicationEntity)
    private readonly jobApplicationRepository: Repository<JobApplicationEntity>,
    private readonly cloudinaryService: UploadCloudinaryService,
  ) {}

  async getMyProfile(user: User): Promise<CandidateProfileResponseDto> {
    const profile = await this.findOrCreateProfile(user);
    return this.toCandidateProfileResponse(user, profile);
  }

  async updateMyProfile(
    user: User,
    updateCandidateProfileDto: UpdateCandidateProfileDto,
  ): Promise<CandidateProfileResponseDto> {
    if (updateCandidateProfileDto.fullName !== undefined) {
      const fullName = updateCandidateProfileDto.fullName.trim();
      if (!fullName) {
        throw new BadRequestException('Họ tên không được để trống');
      }
      user.fullName = fullName;
    }
    if (updateCandidateProfileDto.phone !== undefined) {
      user.phone = this.normalizeUserOptionalString(
        updateCandidateProfileDto.phone,
      );
    }
    if (updateCandidateProfileDto.avatar !== undefined) {
      user.avatar = this.normalizeUserOptionalString(
        updateCandidateProfileDto.avatar,
      );
    }

    const profile = await this.findOrCreateProfile(user);
    this.candidateProfileRepository.merge(profile, {
      currentTitle: this.normalizeOptionalString(
        updateCandidateProfileDto.currentTitle,
      ),
      totalExperienceYears: this.normalizeOptionalString(
        updateCandidateProfileDto.totalExperienceYears,
      ),
      summary: this.normalizeOptionalString(updateCandidateProfileDto.summary),
      skills: this.normalizeList(updateCandidateProfileDto.skills),
      education: this.normalizeList(updateCandidateProfileDto.education),
      workExperience: this.normalizeList(
        updateCandidateProfileDto.workExperience,
      ),
      certifications: this.normalizeList(
        updateCandidateProfileDto.certifications,
      ),
      languages: this.normalizeList(updateCandidateProfileDto.languages),
      portfolioUrl: this.normalizeOptionalString(
        updateCandidateProfileDto.portfolioUrl,
      ),
      linkedinUrl: this.normalizeOptionalString(
        updateCandidateProfileDto.linkedinUrl,
      ),
      githubUrl: this.normalizeOptionalString(
        updateCandidateProfileDto.githubUrl,
      ),
    });

    const [savedUser, savedProfile] = await Promise.all([
      this.userRepository.save(user),
      this.candidateProfileRepository.save(profile),
    ]);

    return this.toCandidateProfileResponse(savedUser, savedProfile);
  }

  async updateMyAvatar(
    user: User,
    avatar: Express.Multer.File,
  ): Promise<CandidateProfileResponseDto> {
    const uploadResult = await this.cloudinaryService.uploadImage(avatar);
    user.avatar = uploadResult.secure_url;

    const [savedUser, profile] = await Promise.all([
      this.userRepository.save(user),
      this.findOrCreateProfile(user),
    ]);

    return this.toCandidateProfileResponse(savedUser, profile);
  }

  async getProfileByUserId(
    userId: string,
    viewer: User,
  ): Promise<CandidateProfileResponseDto> {
    await this.ensureCanViewCandidateProfile(userId, viewer);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Ứng viên không tồn tại');
    }

    const profile = await this.candidateProfileRepository.findOne({
      where: { userId },
    });

    return this.toCandidateProfileResponse(user, profile);
  }

  private async findOrCreateProfile(user: User) {
    const existingProfile = await this.candidateProfileRepository.findOne({
      where: { userId: user.id },
    });
    if (existingProfile) {
      return existingProfile;
    }

    const profile = this.candidateProfileRepository.create({
      user,
      userId: user.id,
    });
    return this.candidateProfileRepository.save(profile);
  }

  private async ensureCanViewCandidateProfile(userId: string, viewer: User) {
    if (viewer.id === userId) {
      return;
    }
    if (viewer.role === UserRole.ADMIN) {
      return;
    }
    if (viewer.role === UserRole.RECRUITER) {
      const hasApplied = await this.jobApplicationRepository
        .createQueryBuilder('application')
        .innerJoin('application.job', 'job')
        .innerJoin('job.company', 'company')
        .where('application.candidate_id = :candidateId', {
          candidateId: userId,
        })
        .andWhere("company.created_by ->> 'id' = :recruiterId", {
          recruiterId: viewer.id,
        })
        .getExists();
      if (hasApplied) {
        return;
      }
    }
    throw new ForbiddenException('Bạn không có quyền xem hồ sơ ứng viên này');
  }

  private normalizeOptionalString(value?: string) {
    if (value === undefined) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeUserOptionalString(value?: string) {
    if (value === undefined) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private normalizeList(value?: string[]) {
    if (value === undefined) {
      return undefined;
    }
    const normalized = value
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return normalized.length > 0 ? normalized : null;
  }

  private toCandidateProfileResponse(
    user: User,
    profile: CandidateProfileEntity | null,
  ): CandidateProfileResponseDto {
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone ?? null,
        avatar: user.avatar ?? null,
        role: user.role,
      },
      profile: profile
        ? {
            id: profile.id,
            currentTitle: profile.currentTitle ?? null,
            totalExperienceYears: profile.totalExperienceYears ?? null,
            summary: profile.summary ?? null,
            skills: profile.skills ?? null,
            education: profile.education ?? null,
            workExperience: profile.workExperience ?? null,
            certifications: profile.certifications ?? null,
            languages: profile.languages ?? null,
            portfolioUrl: profile.portfolioUrl ?? null,
            linkedinUrl: profile.linkedinUrl ?? null,
            githubUrl: profile.githubUrl ?? null,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }
        : null,
    };
  }
}
