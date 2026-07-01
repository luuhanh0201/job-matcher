import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
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
import { MatchResultsService } from '@/modules/match-results/match-results.service';
import { JobApplicationEntity } from '@/modules/job-applications/entities/job-application.entity';
import { isPdfMagicBytes } from './pdf-parser.service';

const UPLOAD_COOLDOWN_MS = 5 * 60 * 1000;
const MATCH_TRIGGER_COOLDOWN_MS = 60 * 1000;

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

type CvPreview = {
  cv: Cv;
  buffer: Buffer;
};

@Injectable()
export class CvService {
  private readonly deviceUploadAt = new Map<string, number>();
  private readonly matchTriggerAt = new Map<string, number>();
  private readonly logger = new Logger(CvService.name);

  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    @InjectRepository(ParsedCv)
    private readonly parsedCvRepository: Repository<ParsedCv>,
    @InjectRepository(JobApplicationEntity)
    private readonly jobApplicationRepository: Repository<JobApplicationEntity>,
    private readonly uploadCloudinaryService: UploadCloudinaryService,
    private readonly matchResultsService: MatchResultsService,
  ) {}

  async uploadCv(
    identity: UploadIdentity,
    file: Express.Multer.File,
  ): Promise<UploadCvResult> {
    if (
      identity.role !== UserRole.CANDIDATE &&
      identity.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Chỉ ứng viên mới có thể upload CV');
    }

    if (identity.role !== UserRole.ADMIN) {
      await this.enforceAccountCooldown(identity.userId);
      this.enforceDeviceCooldown(identity.deviceId);
    }

    if (!isPdfMagicBytes(file.buffer)) {
      throw new BadRequestException('Nội dung tệp không phải là PDF hợp lệ.');
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

      await this.cleanupOldCvs(identity.userId, savedCv.id);

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

  private async cleanupOldCvs(userId: string, keepCvId: string) {
    const oldCvs = await this.cvRepository.find({
      where: { userId },
    });
    const toDelete = oldCvs.filter((oldCv) => oldCv.id !== keepCvId);
    if (toDelete.length === 0) {
      return;
    }

    for (const oldCv of toDelete) {
      await this.uploadCloudinaryService
        .deleteFile(oldCv.publicId)
        .catch((err: unknown) =>
          this.logger.warn(
            `Không thể xoá file Cloudinary cũ ${oldCv.publicId}: ${String(err)}`,
          ),
        );
    }

    // Xoá row Cv cũ sẽ cascade xoá ParsedCv + match_results liên quan (đã cấu hình onDelete CASCADE).
    await this.cvRepository.remove(toDelete).catch((err: unknown) => {
      this.logger.error('Không thể dọn CV cũ trong database', err);
    });
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

  async saveParsedCv(
    input: SaveParsedCvDto,
    caller: { id: string; role: UserRole },
  ): Promise<ParsedCv> {
    const cv = await this.cvRepository.findOneBy({ id: input.cvId });
    if (!cv) {
      throw new NotFoundException(`CV with id ${input.cvId} not found`);
    }
    if (caller.role !== UserRole.ADMIN && cv.userId !== caller.id) {
      throw new ForbiddenException('Bạn không có quyền cập nhật CV này');
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
      const savedUpdated = await this.parsedCvRepository.save(updated);

      this.triggerMatchingWithCooldown(cv.userId, savedUpdated.id);

      return savedUpdated;
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
    const savedParsedCv = await this.parsedCvRepository.save(parsedCv);

    this.triggerMatchingWithCooldown(cv.userId, savedParsedCv.id);

    return savedParsedCv;
  }

  private triggerMatchingWithCooldown(userId: string, parsedCvId: string) {
    const lastTriggeredAt = this.matchTriggerAt.get(userId);
    if (
      lastTriggeredAt &&
      Date.now() - lastTriggeredAt < MATCH_TRIGGER_COOLDOWN_MS
    ) {
      this.logger.warn(
        `Bỏ qua trigger matching cho user ${userId} do đang trong cooldown`,
      );
      return;
    }
    this.matchTriggerAt.set(userId, Date.now());

    // Fire-and-forget: trigger job matching after CV parse completes
    this.matchResultsService
      .runMatchingForParsedCv(parsedCvId)
      .catch((err: unknown) =>
        this.logger.error('Background job matching failed', err),
      );
  }

  async findOne(publicId: string): Promise<Cv> {
    const cv = await this.cvRepository.findOneBy({ publicId });
    if (!cv) {
      throw new NotFoundException(`CV with publicId ${publicId} not found`);
    }
    return cv;
  }

  async findMyCvs(userId: string): Promise<Cv[]> {
    return this.cvRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findCvsByUserId(
    userId: string,
    viewer: { id: string; role: UserRole },
  ): Promise<Cv[]> {
    await this.ensureCanViewCandidateCvs(userId, viewer);
    return this.findMyCvs(userId);
  }

  async findCvById(
    id: string,
    viewer: { id: string; role: UserRole },
  ): Promise<Cv> {
    const cv = await this.cvRepository.findOne({ where: { id } });
    if (!cv) {
      throw new NotFoundException('CV không tồn tại');
    }
    await this.ensureCanViewCandidateCvs(cv.userId, viewer);
    return cv;
  }

  async getCvPreview(
    id: string,
    viewer: { id: string; role: UserRole },
  ): Promise<CvPreview> {
    const cv = await this.findCvById(id, viewer);

    const response = await fetch(cv.fileUrl);
    if (!response.ok) {
      throw new InternalServerErrorException('Không thể tải nội dung CV');
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
      cv,
      buffer: Buffer.from(arrayBuffer),
    };
  }

  private async ensureCanViewCandidateCvs(
    userId: string,
    viewer: { id: string; role: UserRole },
  ) {
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
    throw new ForbiddenException('Bạn không có quyền xem CV của ứng viên này');
  }
}
