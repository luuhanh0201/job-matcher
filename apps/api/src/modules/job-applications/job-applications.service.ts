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
import { MailService } from '@/modules/mail/mail.service';
import { User } from '@/modules/user/entities/user.entity';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { JobApplicationStatusLogResponseDto } from './dto/job-application-status-log-response.dto';
import { JobApplicationEntity } from './entities/job-application.entity';
import { JobApplicationStatusLogEntity } from './entities/job-application-status-log.entity';

const JOB_APPLICATION_STATUS_LABEL: Record<JobApplicationStatus, string> = {
  [JobApplicationStatus.PENDING]: 'Chờ xem xét',
  [JobApplicationStatus.VIEWED]: 'Đã xem',
  [JobApplicationStatus.SHORTLISTED]: 'Phù hợp',
  [JobApplicationStatus.REJECTED]: 'Từ chối',
  [JobApplicationStatus.INTERVIEW]: 'Phỏng vấn',
  [JobApplicationStatus.HIRED]: 'Đã tuyển',
};

// Bảng trạng thái hợp lệ: HIRED/REJECTED là trạng thái cuối, không cho quay lại.
// INTERVIEW chỉ được set qua flow tạo lịch phỏng vấn (InterviewsService), không qua updateStatus.
const ALLOWED_STATUS_TRANSITIONS: Record<
  JobApplicationStatus,
  JobApplicationStatus[]
> = {
  [JobApplicationStatus.PENDING]: [
    JobApplicationStatus.VIEWED,
    JobApplicationStatus.SHORTLISTED,
    JobApplicationStatus.REJECTED,
  ],
  [JobApplicationStatus.VIEWED]: [
    JobApplicationStatus.SHORTLISTED,
    JobApplicationStatus.REJECTED,
  ],
  [JobApplicationStatus.SHORTLISTED]: [JobApplicationStatus.REJECTED],
  [JobApplicationStatus.INTERVIEW]: [
    JobApplicationStatus.HIRED,
    JobApplicationStatus.REJECTED,
    JobApplicationStatus.SHORTLISTED,
  ],
  [JobApplicationStatus.HIRED]: [],
  [JobApplicationStatus.REJECTED]: [],
};

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectRepository(JobApplicationEntity)
    private readonly jobApplicationRepository: Repository<JobApplicationEntity>,
    @InjectRepository(JobApplicationStatusLogEntity)
    private readonly statusLogRepository: Repository<JobApplicationStatusLogEntity>,
    @InjectRepository(JobPostEntity)
    private readonly jobPostRepository: Repository<JobPostEntity>,
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    private readonly mailService: MailService,
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
    await this.createStatusLog(
      {
        ...savedApplication,
        job,
        candidate,
        cv,
      },
      null,
      JobApplicationStatus.PENDING,
      candidate,
    );

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

  async findStatusLogs(
    applicationId: string,
    user: User,
  ): Promise<JobApplicationStatusLogResponseDto[]> {
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
    this.ensureCanViewApplication(application, user);

    const logs = await this.statusLogRepository.find({
      where: { applicationId },
      relations: {
        changedBy: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return logs.map((log) => this.toStatusLogResponse(log));
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

    const previousStatus = application.status;
    if (previousStatus !== status) {
      this.ensureValidStatusTransition(previousStatus, status);
    }
    application.status = status;
    const savedApplication =
      await this.jobApplicationRepository.save(application);

    if (previousStatus !== status) {
      await this.createStatusLog(
        application,
        previousStatus,
        status,
        recruiter,
      );
      await this.sendApplicationStatusEmail(savedApplication);
    }

    return this.toJobApplicationResponse(savedApplication);
  }

  private ensureValidStatusTransition(
    from: JobApplicationStatus,
    to: JobApplicationStatus,
  ) {
    if (to === JobApplicationStatus.INTERVIEW) {
      throw new BadRequestException(
        'Vui lòng dùng chức năng mời phỏng vấn để chuyển hồ sơ sang trạng thái Phỏng vấn',
      );
    }
    const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[from] ?? [];
    if (!allowedNextStatuses.includes(to)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ "${JOB_APPLICATION_STATUS_LABEL[from]}" sang "${JOB_APPLICATION_STATUS_LABEL[to]}"`,
      );
    }
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

  private ensureCanViewApplication(
    application: JobApplicationEntity,
    user: User,
  ) {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    if (
      user.role === UserRole.CANDIDATE &&
      application.candidateId === user.id
    ) {
      return;
    }

    if (user.role === UserRole.RECRUITER) {
      this.ensureApplicationOwner(application, user);
      return;
    }

    throw new ForbiddenException(
      'Bạn không có quyền xem lịch sử hồ sơ ứng tuyển này',
    );
  }

  private async createStatusLog(
    application: JobApplicationEntity,
    fromStatus: JobApplicationStatus | null,
    toStatus: JobApplicationStatus,
    changedBy: User,
  ) {
    const log = this.statusLogRepository.create({
      application,
      applicationId: application.id,
      fromStatus,
      toStatus,
      content: this.buildStatusLogContent(fromStatus, toStatus, changedBy),
      changedBy,
      changedById: changedBy.id,
      changedBySnapshot: {
        id: changedBy.id,
        fullName: changedBy.fullName,
        email: changedBy.email,
        role: changedBy.role,
      },
    });

    await this.statusLogRepository.save(log);
  }

  private buildStatusLogContent(
    fromStatus: JobApplicationStatus | null,
    toStatus: JobApplicationStatus,
    changedBy: User,
  ) {
    if (!fromStatus) {
      return `${changedBy.fullName} đã tạo hồ sơ ứng tuyển với trạng thái ${JOB_APPLICATION_STATUS_LABEL[toStatus]}`;
    }

    return `${changedBy.fullName} đã cập nhật trạng thái từ ${JOB_APPLICATION_STATUS_LABEL[fromStatus]} sang ${JOB_APPLICATION_STATUS_LABEL[toStatus]}`;
  }

  private async sendApplicationStatusEmail(application: JobApplicationEntity) {
    const payload = {
      to: application.candidate.email,
      candidateName: application.candidate.fullName,
      jobTitle: application.job.title,
      companyName: application.job.company?.name ?? 'Job Matcher',
    };

    if (application.status === JobApplicationStatus.HIRED) {
      await this.mailService.sendApplicationHiredEmail(payload);
      return;
    }

    if (application.status === JobApplicationStatus.REJECTED) {
      await this.mailService.sendApplicationRejectedEmail(payload);
      return;
    }

    if (application.status === JobApplicationStatus.SHORTLISTED) {
      await this.mailService.sendCandidateTalentPoolEmail(payload);
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

  private toStatusLogResponse(
    log: JobApplicationStatusLogEntity,
  ): JobApplicationStatusLogResponseDto {
    const changedBySnapshot = log.changedBySnapshot;

    return {
      id: log.id,
      applicationId: log.applicationId,
      fromStatus: log.fromStatus ?? null,
      toStatus: log.toStatus,
      content: log.content,
      changedBy: changedBySnapshot
        ? {
            id: changedBySnapshot.id,
            fullName: changedBySnapshot.fullName,
            email: changedBySnapshot.email,
            role: changedBySnapshot.role,
          }
        : null,
      createdAt: log.createdAt,
    };
  }
}
