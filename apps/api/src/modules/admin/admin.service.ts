import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPostStatus } from '@/common/enum/Job.enum';
import { UserRole, UserStatus } from '@/common/enum/index.enum';
import { AiUsageLogEntity } from '@/modules/ai-usage/entities/ai-usage-log.entity';
import {
  CompanyEntity,
  CompanyStatus,
} from '@/modules/company/entity/company.entity';
import { CompanyResponseDto } from '@/modules/company/dto/company-response.dto';
import { MailService } from '@/modules/mail/mail.service';
import { MatchingQueueService } from '@/modules/matching-queue/matching-queue.service';
import { RecruiterEntity } from '@/modules/recruiters/entity/recruiter.entity';
import { JobApplicationEntity } from '@/modules/job-applications/entities/job-application.entity';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import {
  JobPostResponseDto,
  PaginatedJobsResponseDto,
} from '@/modules/jobs/dto/job-response.dto';
import { JobsService } from '@/modules/jobs/jobs.service';
import { User } from '@/modules/user/entities/user.entity';
import { QueryAdminCompaniesDto } from './dto/query-admin-companies.dto';
import { QueryAdminJobsDto } from './dto/query-admin-jobs.dto';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';
import { UpdateAdminCompanyStatusDto } from './dto/update-admin-company-status.dto';
import {
  AdminCompanyDetailResponseDto,
  AdminStatsResponseDto,
  AdminUserResponseDto,
  PaginatedAdminCompaniesResponseDto,
  PaginatedAdminUsersResponseDto,
} from './dto/admin-response.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(JobPostEntity)
    private readonly jobPostRepository: Repository<JobPostEntity>,
    @InjectRepository(JobApplicationEntity)
    private readonly jobApplicationRepository: Repository<JobApplicationEntity>,
    @InjectRepository(AiUsageLogEntity)
    private readonly aiUsageLogRepository: Repository<AiUsageLogEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    @InjectRepository(RecruiterEntity)
    private readonly recruiterRepository: Repository<RecruiterEntity>,
    private readonly jobsService: JobsService,
    private readonly mailService: MailService,
    private readonly matchingQueueService: MatchingQueueService,
  ) {}

  // ─── Users ────────────────────────────────────────────────────────────

  async findUsers(
    query: QueryAdminUsersDto,
  ): Promise<PaginatedAdminUsersResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.userRepository.createQueryBuilder('user');

    if (query.keyword?.trim()) {
      qb.andWhere(
        `(unaccent(user.full_name) ILIKE unaccent(:kw) OR user.email ILIKE :kw)`,
        { kw: `%${query.keyword.trim()}%` },
      );
    }
    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }
    if (query.status) {
      qb.andWhere('user.status = :status', { status: query.status });
    }

    const [users, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: users.map((user) => this.toAdminUserResponse(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserStatus(
    userId: string,
    status: UserStatus,
    admin: User,
  ): Promise<AdminUserResponseDto> {
    if (userId === admin.id) {
      throw new BadRequestException(
        'Không thể thay đổi trạng thái tài khoản của chính mình',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException(
        'Không thể thay đổi trạng thái tài khoản admin khác',
      );
    }

    user.status = status;
    const savedUser = await this.userRepository.save(user);
    return this.toAdminUserResponse(savedUser);
  }

  // ─── Companies ────────────────────────────────────────────────────────

  async findCompanies(
    query: QueryAdminCompaniesDto,
  ): Promise<PaginatedAdminCompaniesResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.companyRepository.createQueryBuilder('company');

    if (query.keyword?.trim()) {
      qb.andWhere(
        `(unaccent(company.name) ILIKE unaccent(:kw)
          OR company.tax_code ILIKE :kw
          OR company.created_by ->> 'email' ILIKE :kw)`,
        { kw: `%${query.keyword.trim()}%` },
      );
    }
    if (query.status) {
      qb.andWhere('company.status = :status', { status: query.status });
    }

    const [companies, total] = await qb
      .orderBy(
        // Công ty chờ duyệt hiển thị trước để admin xử lý sớm
        `CASE WHEN company.status = '${CompanyStatus.PENDING_APPROVAL}' THEN 0 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy('company.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCompanyDetail(
    companyId: string,
  ): Promise<AdminCompanyDetailResponseDto> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new BadRequestException('Công ty không tồn tại');
    }

    const recruiterUserId = company.createdBy?.id;
    if (!recruiterUserId) {
      return { ...company, recruiter: null };
    }

    const [user, recruiterProfile] = await Promise.all([
      this.userRepository.findOne({ where: { id: recruiterUserId } }),
      this.recruiterRepository.findOne({
        where: { userId: recruiterUserId },
      }),
    ]);
    if (!user) {
      return { ...company, recruiter: null };
    }

    return {
      ...company,
      recruiter: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone ?? null,
        avatar: user.avatar ?? null,
        status: user.status,
        isVerify: user.isVerify,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        contactPhone: recruiterProfile?.contactPhone ?? null,
        contactEmail: recruiterProfile?.contactEmail ?? null,
      },
    };
  }

  async updateCompanyStatus(
    companyId: string,
    dto: UpdateAdminCompanyStatusDto,
    admin: User,
  ): Promise<CompanyResponseDto> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new BadRequestException('Công ty không tồn tại');
    }

    const reason = dto.reason?.trim();
    if (dto.status === CompanyStatus.REJECTED && !reason) {
      throw new BadRequestException('Vui lòng nhập lý do từ chối');
    }

    const previousStatus = company.status;
    company.status = dto.status;
    company.isVerified = dto.status === CompanyStatus.ACTIVE;
    company.rejectionReason =
      dto.status === CompanyStatus.REJECTED ? reason : null;
    company.updatedBy = {
      id: admin.id,
      name: admin.fullName,
      email: admin.email,
    };

    const savedCompany = await this.companyRepository.save(company);

    const recipient = savedCompany.createdBy?.email ?? savedCompany.email;
    if (recipient && previousStatus !== savedCompany.status) {
      const recipientName = savedCompany.createdBy?.name ?? 'bạn';
      if (savedCompany.status === CompanyStatus.ACTIVE) {
        await this.mailService.sendCompanyApprovedEmail({
          to: recipient,
          name: recipientName,
          companyName: savedCompany.name,
        });
      } else if (savedCompany.status === CompanyStatus.REJECTED) {
        await this.mailService.sendCompanyRejectedEmail({
          to: recipient,
          name: recipientName,
          companyName: savedCompany.name,
          reason: savedCompany.rejectionReason,
        });
      }
    }

    return savedCompany;
  }

  // ─── Jobs ─────────────────────────────────────────────────────────────

  async findJobs(query: QueryAdminJobsDto): Promise<PaginatedJobsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.jobPostRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.createdBy', 'createdBy');

    if (query.keyword?.trim()) {
      qb.andWhere(
        `(unaccent(job.title) ILIKE unaccent(:kw) OR unaccent(company.name) ILIKE unaccent(:kw))`,
        { kw: `%${query.keyword.trim()}%` },
      );
    }
    if (query.status) {
      qb.andWhere('job.status = :status', { status: query.status });
    }

    const [jobs, total] = await qb
      .orderBy('job.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: jobs.map((job) => this.jobsService.toJobPostResponse(job)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateJobStatus(
    jobId: string,
    status: JobPostStatus,
  ): Promise<JobPostResponseDto> {
    const job = await this.jobPostRepository.findOne({
      where: { id: jobId },
      relations: { company: true, createdBy: true },
    });
    if (!job) {
      throw new BadRequestException('Tin tuyển dụng không tồn tại');
    }

    const previousStatus = job.status;
    job.status = status;
    if (status === JobPostStatus.OPEN && !job.publishedAt) {
      job.publishedAt = new Date();
    }

    const savedJob = await this.jobPostRepository.save(job);
    if (
      savedJob.status === JobPostStatus.OPEN &&
      previousStatus !== JobPostStatus.OPEN
    ) {
      // Matching theo sự kiện: job vừa được admin mở → chấm với các CV gần đây
      void this.matchingQueueService.enqueueNewJobMatching(savedJob.id);
    }
    return this.jobsService.toJobPostResponse(savedJob);
  }

  // ─── Stats ────────────────────────────────────────────────────────────

  async getStats(): Promise<AdminStatsResponseDto> {
    const [
      usersByRole,
      usersByStatus,
      newUsersLast30Days,
      jobsByStatus,
      applicationsByStatus,
      aiUsage,
    ] = await Promise.all([
      this.countGroupBy(this.userRepository, 'user', 'role'),
      this.countGroupBy(this.userRepository, 'user', 'status'),
      this.userRepository
        .createQueryBuilder('user')
        .where("user.created_at >= NOW() - INTERVAL '30 days'")
        .getCount(),
      this.countGroupBy(this.jobPostRepository, 'job', 'status'),
      this.countGroupBy(this.jobApplicationRepository, 'application', 'status'),
      this.aiUsageLogRepository
        .createQueryBuilder('log')
        .select('COUNT(*)', 'totalRequests')
        .addSelect('COALESCE(SUM(log.total_tokens), 0)', 'totalTokens')
        .addSelect(
          `COUNT(*) FILTER (WHERE log.created_at >= NOW() - INTERVAL '30 days')`,
          'requestsLast30Days',
        )
        .getRawOne<{
          totalRequests: string;
          totalTokens: string;
          requestsLast30Days: string;
        }>(),
    ]);

    return {
      users: {
        total: Object.values(usersByRole).reduce((sum, n) => sum + n, 0),
        byRole: usersByRole,
        byStatus: usersByStatus,
        newLast30Days: newUsersLast30Days,
      },
      jobs: {
        total: Object.values(jobsByStatus).reduce((sum, n) => sum + n, 0),
        byStatus: jobsByStatus,
      },
      applications: {
        total: Object.values(applicationsByStatus).reduce(
          (sum, n) => sum + n,
          0,
        ),
        byStatus: applicationsByStatus,
      },
      aiUsage: {
        totalRequests: Number(aiUsage?.totalRequests ?? 0),
        totalTokens: Number(aiUsage?.totalTokens ?? 0),
        requestsLast30Days: Number(aiUsage?.requestsLast30Days ?? 0),
      },
    };
  }

  private async countGroupBy<T extends { id: string }>(
    repository: Repository<T>,
    alias: string,
    column: string,
  ): Promise<Record<string, number>> {
    const rows = await repository
      .createQueryBuilder(alias)
      .select(`${alias}.${column}`, 'key')
      .addSelect('COUNT(*)', 'count')
      .groupBy(`${alias}.${column}`)
      .getRawMany<{ key: string; count: string }>();

    return Object.fromEntries(rows.map((row) => [row.key, Number(row.count)]));
  }

  private toAdminUserResponse(user: User): AdminUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? null,
      avatar: user.avatar ?? null,
      role: user.role,
      status: user.status,
      isVerify: user.isVerify,
      provider: user.provider ?? null,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}
