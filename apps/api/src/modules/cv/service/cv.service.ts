import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv, FileType } from '../entities/cv.entity';
import { ParsedCv } from '../entities/parsed-cv.entity';
import { Repository } from 'typeorm';
import { UploadCloudinaryService } from '@/modules/upload-cloudinary/upload-cloudinary.service';
import { UploadStatus } from '@/common/enum/StatusUpload.enum';
import { UserRole } from '@/common/enum/index.enum';
import { SaveParsedCvDto } from '../dto/save-parsed-cv.dto';

const UPLOAD_COOLDOWN_MS = 5 * 60 * 1000;

type UploadCvResult = {
  cv: Cv;
  cvId: string;
  status: UploadStatus;
  message: string;
};

type UploadIdentity = {
  userId: string;
  role: UserRole;
  deviceId: string;
};

@Injectable()
export class CvService {
  private readonly deviceUploadAt = new Map<string, number>();

  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    @InjectRepository(ParsedCv)
    private readonly parsedCvRepository: Repository<ParsedCv>,
    private readonly uploadCloudinaryService: UploadCloudinaryService,
  ) {}

  async uploadCv(
    identity: UploadIdentity,
    file: Express.Multer.File,
  ): Promise<UploadCvResult> {
    if (identity.role !== UserRole.ADMIN) {
      await this.enforceAccountCooldown(identity.userId);
      this.enforceDeviceCooldown(identity.deviceId);
    }

    const existingCv = await this.cvRepository.findOne({
      where: {
        fileName: file.originalname,
        userId: identity.userId,
        uploadStatus: UploadStatus.COMPLETED,
      },
    });

    if (existingCv) {
      return {
        cv: existingCv,
        cvId: existingCv.id,
        status: UploadStatus.COMPLETED,
        message: 'Tải lên CV thành công.',
      };
    }
    let uploadedPublicId: string | null = null;

    try {
      const uploadResult = await this.uploadCloudinaryService.uploadPdf(file);
      uploadedPublicId = uploadResult.public_id;

      const cv = this.cvRepository.create({
        userId: identity.userId,
        publicId: uploadResult.public_id,
        fileName: file.originalname,
        fileType: FileType.PDF,
        fileUrl: uploadResult.secure_url,
        uploadStatus: UploadStatus.COMPLETED,
      });

      const savedCv = await this.cvRepository.save(cv);

      if (identity.role !== UserRole.ADMIN) {
        this.deviceUploadAt.set(identity.deviceId, Date.now());
      }

      return {
        cv: savedCv,
        cvId: savedCv.id,
        status: UploadStatus.COMPLETED,
        message: 'Upload CV thành công. Hệ thống đang xử lý nội dung CV.',
      };
    } catch (error) {
      if (uploadedPublicId) {
        await this.uploadCloudinaryService
          .deleteFile(uploadedPublicId)
          .catch(() => undefined);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Không thể upload CV');
    }
  }

  private async enforceAccountCooldown(userId: string) {
    const latestUpload = await this.cvRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!latestUpload) {
      return;
    }

    const elapsed = Date.now() - new Date(latestUpload.createdAt).getTime();
    if (elapsed < UPLOAD_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((UPLOAD_COOLDOWN_MS - elapsed) / 1000);
      throw new HttpException(
        `Bạn chỉ được upload lại sau ${waitSeconds} giây (giới hạn theo tài khoản).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private enforceDeviceCooldown(deviceId: string) {
    const latestUploadAt = this.deviceUploadAt.get(deviceId);
    if (!latestUploadAt) {
      return;
    }

    const elapsed = Date.now() - latestUploadAt;
    if (elapsed < UPLOAD_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((UPLOAD_COOLDOWN_MS - elapsed) / 1000);
      throw new HttpException(
        `Thiết bị này chỉ được upload lại sau ${waitSeconds} giây.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async saveParsedCv(input: SaveParsedCvDto): Promise<ParsedCv> {
    const cv = await this.cvRepository.findOneBy({ id: input.cvId });
    if (!cv) {
      throw new NotFoundException(`CV with id ${input.cvId} not found`);
    }

    const existing = await this.parsedCvRepository.findOneBy({
      cv: { id: cv.id },
    });

    if (existing) {
      const updated = this.parsedCvRepository.merge(existing, {
        candidateName: input.candidateName,
        email: input.email,
        phone: input.phone,
        totalExperienceYears: input.totalExperienceYears,
        currentTitle: input.currentTitle,
        skills: input.skills,
        education: input.education,
        workExperience: input.workExperience,
        certifications: input.certifications,
        languages: input.languages,
      });
      return this.parsedCvRepository.save(updated);
    }

    const parsedCv = this.parsedCvRepository.create({
      cv,
      candidateName: input.candidateName,
      email: input.email,
      phone: input.phone,
      totalExperienceYears: input.totalExperienceYears,
      currentTitle: input.currentTitle,
      skills: input.skills,
      education: input.education,
      workExperience: input.workExperience,
      certifications: input.certifications,
      languages: input.languages,
    });
    return this.parsedCvRepository.save(parsedCv);
  }

  async findOne(publicId: string): Promise<Cv> {
    const cv = await this.cvRepository.findOneBy({ publicId });
    if (!cv) {
      throw new NotFoundException(`CV with publicId ${publicId} not found`);
    }
    return cv;
  }
}
