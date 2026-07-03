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
import { JobApplicationEntity } from '@/modules/job-applications/entities/job-application.entity';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import {
  JobPostResponseDto,
  PaginatedJobsResponseDto,
} from '@/modules/jobs/dto/job-response.dto';
import { JobsService } from '@/modules/jobs/jobs.service';
import { User } from '@/modules/user/entities/user.entity';
import { QueryAdminJobsDto } from './dto/query-admin-jobs.dto';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';
import {
  AdminStatsResponseDto,
  AdminUserResponseDto,
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
    private readonly jobsService: JobsService,
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

    job.status = status;
    if (status === JobPostStatus.OPEN && !job.publishedAt) {
      job.publishedAt = new Date();
    }

    const savedJob = await this.jobPostRepository.save(job);
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
