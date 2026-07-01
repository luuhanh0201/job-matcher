import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewStatus } from '@/common/enum/Interview.enum';
import { JobApplicationStatus } from '@/common/enum/JobApplication.enum';
import { UserRole } from '@/common/enum/index.enum';
import { JobApplicationEntity } from '@/modules/job-applications/entities/job-application.entity';
import { JobApplicationStatusLogEntity } from '@/modules/job-applications/entities/job-application-status-log.entity';
import { MailService } from '@/modules/mail/mail.service';
import { User } from '@/modules/user/entities/user.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { InterviewResponseDto } from './dto/interview-response.dto';
import { RespondInterviewDto } from './dto/respond-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { InterviewEntity } from './entities/interview.entity';

const JOB_APPLICATION_STATUS_LABEL: Record<JobApplicationStatus, string> = {
  [JobApplicationStatus.PENDING]: 'Chờ xem xét',
  [JobApplicationStatus.VIEWED]: 'Đã xem',
  [JobApplicationStatus.SHORTLISTED]: 'Phù hợp',
  [JobApplicationStatus.REJECTED]: 'Từ chối',
  [JobApplicationStatus.INTERVIEW]: 'Phỏng vấn',
  [JobApplicationStatus.HIRED]: 'Đã tuyển',
};

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(InterviewEntity)
    private readonly interviewRepository: Repository<InterviewEntity>,
    @InjectRepository(JobApplicationEntity)
    private readonly jobApplicationRepository: Repository<JobApplicationEntity>,
    @InjectRepository(JobApplicationStatusLogEntity)
    private readonly statusLogRepository: Repository<JobApplicationStatusLogEntity>,
    private readonly mailService: MailService,
  ) {}

  async createInterview(
    applicationId: string,
    recruiter: User,
    createInterviewDto: CreateInterviewDto,
  ): Promise<InterviewResponseDto> {
    this.ensureRecruiter(recruiter);
    const existingInterview = await this.interviewRepository.findOne({
      where: {
        applicationId,
        status: InterviewStatus.PENDING,
        application: {
          job: {
            company: {
              createdBy: {
                id: recruiter.id,
              },
            },
          },
        },
      },
    });
    console.log(existingInterview);
    if (existingInterview) {
      throw new BadRequestException(
        'Đã tồn tại lịch phỏng vấn cho hồ sơ ứng tuyển này',
      );
    }
    const application = await this.findApplicationOrFail(applicationId);
    this.ensureApplicationOwner(application, recruiter);

    const scheduledAt = this.parseFutureScheduledAt(
      createInterviewDto.scheduledAt,
    );

    const interview = this.interviewRepository.create({
      application,
      applicationId: application.id,
      candidate: application.candidate,
      candidateId: application.candidateId,
      recruiter,
      recruiterId: recruiter.id,
      scheduledAt,
      durationMinutes: createInterviewDto.durationMinutes ?? 60,
      meetingUrl: this.normalizeOptionalString(createInterviewDto.meetingUrl),
      location: this.normalizeOptionalString(createInterviewDto.location),
      note: this.normalizeOptionalString(createInterviewDto.note),
      status: InterviewStatus.PENDING,
    });

    const previousApplicationStatus = application.status;
    application.status = JobApplicationStatus.INTERVIEW;
    await this.jobApplicationRepository.save(application);
    if (previousApplicationStatus !== JobApplicationStatus.INTERVIEW) {
      await this.createApplicationStatusLog(
        application,
        previousApplicationStatus,
        JobApplicationStatus.INTERVIEW,
        recruiter,
      );
    }
    const savedInterview = await this.interviewRepository.save(interview);

    await this.mailService.sendInterviewInvitationEmail({
      to: application.candidate.email,
      candidateName: application.candidate.fullName,
      recruiterName: recruiter.fullName,
      jobTitle: application.job.title,
      companyName: application.job.company?.name ?? 'Job Matcher',
      scheduledAt,
      durationMinutes: savedInterview.durationMinutes,
      meetingUrl: savedInterview.meetingUrl,
      location: savedInterview.location,
      note: savedInterview.note,
    });

    return this.toInterviewResponse({
      ...savedInterview,
      application,
      candidate: application.candidate,
      recruiter,
    });
  }

  async findRecruiterInterviews(
    recruiter: User,
  ): Promise<InterviewResponseDto[]> {
    this.ensureRecruiter(recruiter);

    const interviews = await this.interviewRepository.find({
      where: { recruiterId: recruiter.id },
      relations: {
        application: {
          job: {
            company: true,
          },
        },
        candidate: true,
        recruiter: true,
      },
      order: {
        scheduledAt: 'DESC',
      },
    });

    return interviews.map((interview) => this.toInterviewResponse(interview));
  }

  async findMyInterviews(candidate: User): Promise<InterviewResponseDto[]> {
    if (candidate.role !== UserRole.CANDIDATE) {
      throw new ForbiddenException(
        'Chỉ ứng viên mới có thể xem lịch phỏng vấn của mình',
      );
    }

    const interviews = await this.interviewRepository.find({
      where: { candidateId: candidate.id },
      relations: {
        application: {
          job: {
            company: true,
          },
        },
        candidate: true,
        recruiter: true,
      },
      order: {
        scheduledAt: 'DESC',
      },
    });

    return interviews.map((interview) => this.toInterviewResponse(interview));
  }

  async updateInterview(
    interviewId: string,
    recruiter: User,
    updateInterviewDto: UpdateInterviewDto,
  ): Promise<InterviewResponseDto> {
    this.ensureRecruiter(recruiter);

    const interview = await this.findRecruiterInterviewOrFail(
      interviewId,
      recruiter,
    );
    if (interview.status === InterviewStatus.CANCELLED) {
      throw new BadRequestException('Không thể sửa lịch phỏng vấn đã hủy');
    }
    if (interview.scheduledAt <= new Date()) {
      throw new BadRequestException('Không thể sửa lịch phỏng vấn đã quá hạn');
    }

    if (updateInterviewDto.scheduledAt !== undefined) {
      interview.scheduledAt = this.parseFutureScheduledAt(
        updateInterviewDto.scheduledAt,
      );
      interview.status = InterviewStatus.PENDING;
    }
    if (updateInterviewDto.durationMinutes !== undefined) {
      interview.durationMinutes = updateInterviewDto.durationMinutes;
    }
    if (updateInterviewDto.meetingUrl !== undefined) {
      interview.meetingUrl = this.normalizeOptionalString(
        updateInterviewDto.meetingUrl,
      );
    }
    if (updateInterviewDto.location !== undefined) {
      interview.location = this.normalizeOptionalString(
        updateInterviewDto.location,
      );
    }
    if (updateInterviewDto.note !== undefined) {
      interview.note = this.normalizeOptionalString(updateInterviewDto.note);
    }

    const savedInterview = await this.interviewRepository.save(interview);
    await this.mailService.sendInterviewUpdatedEmail(
      this.toInterviewScheduleEmailPayload(savedInterview),
    );

    return this.toInterviewResponse(savedInterview);
  }

  async cancelInterview(
    interviewId: string,
    recruiter: User,
  ): Promise<InterviewResponseDto> {
    this.ensureRecruiter(recruiter);

    const interview = await this.findRecruiterInterviewOrFail(
      interviewId,
      recruiter,
    );
    if (interview.status === InterviewStatus.CANCELLED) {
      throw new BadRequestException('Lịch phỏng vấn đã được hủy trước đó');
    }

    interview.status = InterviewStatus.CANCELLED;
    const savedInterview = await this.interviewRepository.save(interview);
    await this.mailService.sendInterviewCancelledEmail(
      this.toInterviewScheduleEmailPayload(savedInterview),
    );

    return this.toInterviewResponse(savedInterview);
  }

  async respondInterview(
    interviewId: string,
    candidate: User,
    respondInterviewDto: RespondInterviewDto,
  ): Promise<InterviewResponseDto> {
    if (candidate.role !== UserRole.CANDIDATE) {
      throw new ForbiddenException(
        'Chỉ ứng viên mới có thể phản hồi lịch phỏng vấn',
      );
    }

    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: {
        application: {
          job: {
            company: true,
          },
        },
        candidate: true,
        recruiter: true,
      },
    });
    if (!interview) {
      throw new BadRequestException('Lịch phỏng vấn không tồn tại');
    }
    if (interview.candidateId !== candidate.id) {
      throw new ForbiddenException(
        'Bạn không có quyền phản hồi lịch phỏng vấn này',
      );
    }
    if (interview.status === InterviewStatus.CANCELLED) {
      throw new BadRequestException('Lịch phỏng vấn đã bị hủy');
    }
    if (interview.status !== InterviewStatus.PENDING) {
      throw new BadRequestException('Lịch phỏng vấn đã được phản hồi trước đó');
    }
    if (interview.scheduledAt <= new Date()) {
      throw new BadRequestException('Lịch phỏng vấn đã quá hạn xác nhận');
    }

    interview.status = respondInterviewDto.status;
    const savedInterview = await this.interviewRepository.save(interview);

    await this.mailService.sendInterviewResponseEmail({
      to: interview.recruiter.email,
      candidateName: interview.candidate.fullName,
      recruiterName: interview.recruiter.fullName,
      jobTitle: interview.application.job.title,
      companyName: interview.application.job.company?.name ?? 'Job Matcher',
      scheduledAt: interview.scheduledAt,
      status: savedInterview.status,
    });

    return this.toInterviewResponse(savedInterview);
  }

  private async findRecruiterInterviewOrFail(
    interviewId: string,
    recruiter: User,
  ) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: {
        application: {
          job: {
            company: true,
          },
        },
        candidate: true,
        recruiter: true,
      },
    });
    if (!interview) {
      throw new BadRequestException('Lịch phỏng vấn không tồn tại');
    }
    this.ensureApplicationOwner(interview.application, recruiter);

    return interview;
  }

  private async findApplicationOrFail(applicationId: string) {
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
    return application;
  }

  private ensureRecruiter(user: User) {
    if (user.role !== UserRole.RECRUITER) {
      throw new ForbiddenException(
        'Chỉ nhà tuyển dụng mới có thể quản lý phỏng vấn',
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
        'Bạn không có quyền mời phỏng vấn hồ sơ ứng tuyển này',
      );
    }
  }

  private parseFutureScheduledAt(value: string) {
    const scheduledAt = new Date(value);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      throw new BadRequestException(
        'Thời gian phỏng vấn phải là thời điểm trong tương lai',
      );
    }
    return scheduledAt;
  }

  private normalizeOptionalString(value?: string) {
    if (value === undefined) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toInterviewScheduleEmailPayload(interview: InterviewEntity) {
    return {
      to: interview.candidate.email,
      candidateName: interview.candidate.fullName,
      recruiterName: interview.recruiter.fullName,
      jobTitle: interview.application.job.title,
      companyName: interview.application.job.company?.name ?? 'Job Matcher',
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      meetingUrl: interview.meetingUrl,
      location: interview.location,
      note: interview.note,
    };
  }

  private async createApplicationStatusLog(
    application: JobApplicationEntity,
    fromStatus: JobApplicationStatus,
    toStatus: JobApplicationStatus,
    changedBy: User,
  ) {
    const log = this.statusLogRepository.create({
      application,
      applicationId: application.id,
      fromStatus,
      toStatus,
      content: `${changedBy.fullName} đã cập nhật trạng thái từ ${JOB_APPLICATION_STATUS_LABEL[fromStatus]} sang ${JOB_APPLICATION_STATUS_LABEL[toStatus]}`,
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

  private toInterviewResponse(
    interview: InterviewEntity,
  ): InterviewResponseDto {
    return {
      id: interview.id,
      applicationId: interview.applicationId,
      applicationStatus: interview.application.status,
      candidate: {
        id: interview.candidate.id,
        fullName: interview.candidate.fullName,
        email: interview.candidate.email,
        phone: interview.candidate.phone,
        avatar: interview.candidate.avatar,
      },
      recruiter: {
        id: interview.recruiter.id,
        fullName: interview.recruiter.fullName,
        email: interview.recruiter.email,
      },
      job: {
        id: interview.application.job.id,
        title: interview.application.job.title,
        company: interview.application.job.company
          ? {
              id: interview.application.job.company.id,
              name: interview.application.job.company.name,
              logoUrl: interview.application.job.company.logoUrl,
            }
          : null,
      },
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      meetingUrl: interview.meetingUrl ?? null,
      location: interview.location ?? null,
      note: interview.note ?? null,
      status: interview.status,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    };
  }
}
