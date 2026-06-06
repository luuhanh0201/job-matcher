import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { JobApplicationStatus } from '@/common/enum/JobApplication.enum';
import { JobPostStatus } from '@/common/enum/Job.enum';
import { UserRole } from '@/common/enum/index.enum';
import { isPostgresUniqueViolation } from '@/common/helpers/unique-violation.helper';
import { Cv } from '@/modules/cv/entities/cv.entity';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { User } from '@/modules/user/entities/user.entity';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { JobApplicationEntity } from './entities/job-application.entity';

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectRepository(JobApplicationEntity)
    private readonly jobApplicationRepository: Repository<JobApplicationEntity>,
    @InjectRepository(JobPostEntity)
    private readonly jobPostRepository: Repository<JobPostEntity>,
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
  ) {}

  async applyToJob(
    jobId: string,
    candidate: User,
    createJobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplicationResponseDto> {
    if (candidate.role !== UserRole.CANDIDATE) {
      throw new ForbiddenException('Chỉ ứng viên mới có thể ứng tuyển');
    }

    const job = await this.jobPostRepository.findOne({
      where: {
        id: jobId,
        status: JobPostStatus.OPEN,
        expiredAt: MoreThan(new Date()),
      },
      relations: {
        company: true,
      },
    });
    if (!job) {
      throw new BadRequestException(
        'Tin tuyển dụng không tồn tại, đã đóng hoặc đã hết hạn',
      );
    }

    const existingApplication = await this.jobApplicationRepository.findOne({
      where: {
        jobId,
        candidateId: candidate.id,
      },
    });
    if (existingApplication) {
      throw new ConflictException('Bạn đã ứng tuyển tin tuyển dụng này');
    }

    const cv = await this.resolveCandidateCv(
      candidate.id,
      createJobApplicationDto.cvId,
    );

    const application = this.jobApplicationRepository.create({
      job,
      jobId,
      candidate,
      candidateId: candidate.id,
      cv,
      cvId: cv?.id ?? null,
      coverLetter: createJobApplicationDto.coverLetter?.trim() || null,
      status: JobApplicationStatus.PENDING,
    });

    const savedApplication = await this.saveApplication(application);

    return this.toJobApplicationResponse({
      ...savedApplication,
      job,
      candidate,
      cv,
    });
  }

  async findByJob(
    jobId: string,
    recruiter: User,
  ): Promise<JobApplicationResponseDto[]> {
    this.ensureRecruiter(recruiter);

    const job = await this.jobPostRepository.findOne({
      where: { id: jobId },
      relations: {
        company: true,
      },
    });
    if (!job) {
      throw new BadRequestException('Tin tuyển dụng không tồn tại');
    }
    if (
      !job.company?.createdBy?.id ||
      job.company.createdBy.id !== recruiter.id
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền xem danh sách ứng viên của tin này',
      );
    }

    const applications = await this.jobApplicationRepository.find({
      where: { jobId },
      relations: {
        job: {
          company: true,
        },
        candidate: true,
        cv: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return applications.map((application) =>
      this.toJobApplicationResponse(application),
    );
  }

  async findRecruiterApplications(
    recruiter: User,
  ): Promise<JobApplicationResponseDto[]> {
    this.ensureRecruiter(recruiter);

    const applications = await this.jobApplicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('application.cv', 'cv')
      .where("company.created_by ->> 'id' = :recruiterId", {
        recruiterId: recruiter.id,
      })
      .orderBy('application.created_at', 'DESC')
      .getMany();

    return applications.map((application) =>
      this.toJobApplicationResponse(application),
    );
  }

  async findMyApplications(user: User): Promise<JobApplicationResponseDto[]> {
    if (user.role !== UserRole.CANDIDATE) {
      throw new ForbiddenException(
        'Chỉ ứng viên mới có thể xem danh sách việc đã ứng tuyển',
      );
    }

    const applications = await this.jobApplicationRepository.find({
      where: { candidateId: user.id },
      relations: {
        job: {
          company: true,
        },
        candidate: true,
        cv: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return applications.map((application) =>
      this.toJobApplicationResponse(application),
    );
  }

  async updateStatus(
    applicationId: string,
    status: JobApplicationStatus,
    recruiter: User,
  ): Promise<JobApplicationResponseDto> {
    this.ensureRecruiter(recruiter);

    const application = await this.jobApplicationRepository.findOne({
      where: { id: applicationId },
      relations: {
        job: {
          company: true,
        },
        candidate: true,
        cv: true,
      },
    });
    if (!application) {
      throw new BadRequestException('Hồ sơ ứng tuyển không tồn tại');
    }
    this.ensureApplicationOwner(application, recruiter);

    application.status = status;
    const savedApplication =
      await this.jobApplicationRepository.save(application);

    return this.toJobApplicationResponse(savedApplication);
  }

  private async resolveCandidateCv(candidateId: string, cvId?: string) {
    if (cvId) {
      const cv = await this.cvRepository.findOne({
        where: {
          id: cvId,
          userId: candidateId,
        },
      });
      if (!cv) {
        throw new BadRequestException(
          'CV không tồn tại hoặc không thuộc về bạn',
        );
      }
      return cv;
    }

    return this.cvRepository.findOne({
      where: {
        userId: candidateId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  private async saveApplication(application: JobApplicationEntity) {
    try {
      return await this.jobApplicationRepository.save(application);
    } catch (error) {
      if (isPostgresUniqueViolation(error)) {
        throw new ConflictException('Bạn đã ứng tuyển tin tuyển dụng này');
      }
      throw error;
    }
  }

  private ensureRecruiter(user: User) {
    if (user.role !== UserRole.RECRUITER) {
      throw new ForbiddenException(
        'Chỉ nhà tuyển dụng mới có thể xem danh sách ứng viên',
      );
    }
  }

  private ensureApplicationOwner(
    application: JobApplicationEntity,
    recruiter: User,
  ) {
    if (
      !application.job.company?.createdBy?.id ||
      application.job.company.createdBy.id !== recruiter.id
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật hồ sơ ứng tuyển này',
      );
    }
  }

  private toJobApplicationResponse(
    application: JobApplicationEntity,
  ): JobApplicationResponseDto {
    return {
      id: application.id,
      jobId: application.jobId,
      job: {
        id: application.job.id,
        title: application.job.title,
        status: application.job.status,
        company: application.job.company
          ? {
              id: application.job.company.id,
              name: application.job.company.name,
              logoUrl: application.job.company.logoUrl,
            }
          : null,
      },
      candidate: {
        id: application.candidate.id,
        fullName: application.candidate.fullName,
        email: application.candidate.email,
        phone: application.candidate.phone,
        avatar: application.candidate.avatar,
      },
      cv: application.cv
        ? {
            id: application.cv.id,
            publicId: application.cv.publicId,
            fileName: application.cv.fileName,
            fileUrl: application.cv.fileUrl,
            fileType: application.cv.fileType,
          }
        : null,
      coverLetter: application.coverLetter ?? null,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}
