import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPostEntity } from './entities/job.entity';
import { Brackets, MoreThan, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobSortOption, QueryJobsDto } from './dto/query-jobs.dto';
import { User } from '../user/entities/user.entity';
import { CompanyEntity } from '../company/entity/company.entity';
import {
  JobPostResponseDto,
  PaginatedJobsResponseDto,
} from './dto/job-response.dto';
import { JobPostStatus, SalaryType } from '@/common/enum/Job.enum';

// Các cột text dùng để so khớp từ khóa (đều qua unaccent để tìm không dấu)
const KEYWORD_MATCH_SQL = (param: string) =>
  `(unaccent(job.title) ILIKE unaccent(:${param})
    OR unaccent(job.department) ILIKE unaccent(:${param})
    OR unaccent(company.name) ILIKE unaccent(:${param})
    OR unaccent(job.description) ILIKE unaccent(:${param})
    OR unaccent(COALESCE(job.skills::text, '')) ILIKE unaccent(:${param})
    OR unaccent(COALESCE(job.location ->> 'provinceName', '')) ILIKE unaccent(:${param}))`;
@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobPostEntity)
    private readonly jobPostRepository: Repository<JobPostEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  async createPost(
    createJobPostDto: CreateJobDto,
    createdBy: User,
  ): Promise<JobPostResponseDto> {
    const company = await this.companyRepository.findOne({
      where: { id: createJobPostDto.companyId },
    });
    if (!company) {
      throw new BadRequestException(
        'Công ty không tồn tại hoặc chưa đăng ký tại Job Matcher',
      );
    }
    if (!company.createdBy?.id || company.createdBy.id !== createdBy.id) {
      throw new ForbiddenException(
        'Bạn không có quyền đăng tin cho công ty này',
      );
    }
    if (createJobPostDto.salaryType === SalaryType.RANGE) {
      if (
        createJobPostDto.salaryMin === undefined ||
        createJobPostDto.salaryMax === undefined
      ) {
        throw new BadRequestException('Vui lòng nhập khoảng lương');
      }
      if (createJobPostDto.salaryMin > createJobPostDto.salaryMax) {
        throw new BadRequestException(
          'Mức lương tối thiểu không được lớn hơn mức lương tối đa',
        );
      }
    }

    const status = createJobPostDto.status ?? JobPostStatus.DRAFT;
    const job = this.jobPostRepository.create({
      ...createJobPostDto,
      company,
      companyId: company.id,
      createdBy,
      location: company.location,
      status,
      publishedAt: status === JobPostStatus.OPEN ? new Date() : undefined,
      expiredAt: new Date(createJobPostDto.expiredAt),
    });
    const savedJob = await this.jobPostRepository.save(job);
    return this.toJobPostResponse(savedJob);
  }

  async findPublicOpenJobs(
    query: QueryJobsDto,
  ): Promise<PaginatedJobsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const qb = this.jobPostRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.createdBy', 'createdBy')
      .where('job.status = :status', { status: JobPostStatus.OPEN })
      .andWhere('job.expired_at > NOW()');

    this.applyJobFilters(qb, query);
    this.applyJobSort(qb, query.sort ?? JobSortOption.NEWEST);

    const [jobs, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: jobs.map((job) => this.toJobPostResponse(job)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private applyJobFilters(
    qb: SelectQueryBuilder<JobPostEntity>,
    query: QueryJobsDto,
  ): void {
    const keyword = query.keyword?.trim();
    if (keyword) {
      qb.andWhere(KEYWORD_MATCH_SQL('kw'), { kw: `%${keyword}%` });
    }

    // Danh sách từ khóa ngành nghề: khớp bất kỳ từ nào (OR)
    if (query.keywords?.length) {
      qb.andWhere(
        new Brackets((sub) => {
          query.keywords!.forEach((word, index) => {
            sub.orWhere(KEYWORD_MATCH_SQL(`ckw${index}`), {
              [`ckw${index}`]: `%${word}%`,
            });
          });
        }),
      );
    }

    if (query.provinceCode) {
      qb.andWhere("job.location ->> 'provinceCode' = :provinceCode", {
        provinceCode: query.provinceCode,
      });
    }

    // Khớp bất kỳ skill nào được yêu cầu, không phân biệt hoa thường
    if (query.skills?.length) {
      qb.andWhere(
        new Brackets((sub) => {
          query.skills!.forEach((skill, index) => {
            sub.orWhere(
              `EXISTS (
                SELECT 1 FROM jsonb_array_elements_text(COALESCE(job.skills, '[]'::jsonb)) elem
                WHERE unaccent(elem) ILIKE unaccent(:skill${index})
              )`,
              { [`skill${index}`]: skill },
            );
          });
        }),
      );
    }

    if (query.jobType) {
      qb.andWhere('job.job_type = :jobType', { jobType: query.jobType });
    }

    if (query.workMode) {
      qb.andWhere('job.work_mode = :workMode', { workMode: query.workMode });
    }

    if (query.seniorityLevel) {
      qb.andWhere('job.seniority_level = :seniorityLevel', {
        seniorityLevel: query.seniorityLevel,
      });
    }

    // Lọc "lương từ X": giữ lại tin thương lượng vì không có số để so sánh
    if (query.salaryMin !== undefined) {
      qb.andWhere(
        `(job.salary_type = :negotiable
          OR COALESCE(job.salary_max, job.salary_min) >= :salaryMin)`,
        { negotiable: SalaryType.NEGOTIABLE, salaryMin: query.salaryMin },
      );
    }
  }

  private applyJobSort(
    qb: SelectQueryBuilder<JobPostEntity>,
    sort: JobSortOption,
  ): void {
    // Với skip/take, ORDER BY phải là property path hoặc alias có trong SELECT
    if (sort === JobSortOption.SALARY_DESC) {
      qb.addSelect('COALESCE(job.salary_max, job.salary_min)', 'salary_sort')
        .orderBy('salary_sort', 'DESC', 'NULLS LAST')
        .addOrderBy('job.createdAt', 'DESC');
      return;
    }
    qb.orderBy('job.publishedAt', 'DESC', 'NULLS LAST').addOrderBy(
      'job.createdAt',
      'DESC',
    );
  }

  async findPublicOpenJobById(id: string): Promise<JobPostResponseDto> {
    const job = await this.jobPostRepository.findOne({
      where: {
        id,
        status: JobPostStatus.OPEN,
        expiredAt: MoreThan(new Date()),
      },
      relations: {
        company: true,
        createdBy: true,
      },
    });
    if (!job) {
      throw new BadRequestException(
        'Tin tuyển dụng không tồn tại hoặc đã đóng',
      );
    }
    return this.toJobPostResponse(job);
  }

  async findRecruiterJobs(user: User): Promise<JobPostResponseDto[]> {
    const jobs = await this.jobPostRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.createdBy', 'createdBy')
      .where("company.created_by ->> 'id' = :userId", { userId: user.id })
      .orderBy('job.created_at', 'DESC')
      .getMany();

    return jobs.map((job) => this.toJobPostResponse(job));
  }

  async findRecruiterJobById(
    id: string,
    user: User,
  ): Promise<JobPostResponseDto> {
    const job = await this.jobPostRepository.findOne({
      where: { id },
      relations: {
        company: true,
        createdBy: true,
      },
    });
    if (!job) {
      throw new BadRequestException('Tin tuyển dụng không tồn tại');
    }
    if (!job.company?.createdBy?.id || job.company.createdBy.id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xem tin tuyển dụng này');
    }
    return this.toJobPostResponse(job);
  }

  async updateJobContent(
    id: string,
    dto: UpdateJobDto,
    user: User,
  ): Promise<JobPostResponseDto> {
    const job = await this.jobPostRepository.findOne({
      where: { id },
      relations: { company: true, createdBy: true },
    });
    if (!job) {
      throw new BadRequestException('Tin tuyển dụng không tồn tại');
    }
    if (!job.company?.createdBy?.id || job.company.createdBy.id !== user.id) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa tin tuyển dụng này',
      );
    }
    if (job.status === JobPostStatus.BLOCKED) {
      throw new ForbiddenException(
        'Tin tuyển dụng đã bị quản trị viên khóa, không thể chỉnh sửa',
      );
    }
    if (
      dto.salaryType === SalaryType.RANGE ||
      (job.salaryType === SalaryType.RANGE && dto.salaryType === undefined)
    ) {
      const min = dto.salaryMin ?? job.salaryMin;
      const max = dto.salaryMax ?? job.salaryMax;
      if (min !== undefined && max !== undefined && min > max) {
        throw new BadRequestException(
          'Mức lương tối thiểu không được lớn hơn mức lương tối đa',
        );
      }
    }

    Object.assign(job, dto);
    if (dto.expiredAt) {
      job.expiredAt = new Date(dto.expiredAt);
    }
    job.updatedBy = { id: user.id, name: user.fullName, email: user.email };

    const savedJob = await this.jobPostRepository.save(job);
    return this.toJobPostResponse(savedJob);
  }

  async updateStatus(
    id: string,
    status: JobPostStatus,
    user: User,
  ): Promise<JobPostResponseDto> {
    const job = await this.jobPostRepository.findOne({
      where: { id },
      relations: {
        company: true,
        createdBy: true,
      },
    });
    if (!job) {
      throw new BadRequestException('Tin tuyển dụng không tồn tại');
    }
    if (!job.company?.createdBy?.id || job.company.createdBy.id !== user.id) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật tin tuyển dụng này',
      );
    }
    if (job.status === JobPostStatus.BLOCKED) {
      throw new ForbiddenException(
        'Tin tuyển dụng đã bị quản trị viên khóa, vui lòng liên hệ quản trị viên',
      );
    }
    if (status === JobPostStatus.BLOCKED) {
      throw new ForbiddenException('Bạn không có quyền khóa tin tuyển dụng');
    }

    job.status = status;
    if (status === JobPostStatus.OPEN && !job.publishedAt) {
      job.publishedAt = new Date();
    }

    const savedJob = await this.jobPostRepository.save(job);
    return this.toJobPostResponse(savedJob);
  }

  toJobPostResponse(job: JobPostEntity): JobPostResponseDto {
    return {
      id: job.id,
      title: job.title,
      companyId: job.companyId,
      company: job.company
        ? {
            id: job.company.id,
            name: job.company.name,
            shortName: job.company.shortName,
            logoUrl: job.company.logoUrl,
          }
        : null,
      department: job.department,
      jobType: job.jobType,
      workMode: job.workMode,
      seniorityLevel: job.seniorityLevel,
      salaryType: job.salaryType,
      salaryMin: job.salaryMin ?? null,
      salaryMax: job.salaryMax ?? null,
      currency: job.currency,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities ?? null,
      benefits: job.benefits ?? null,
      skills: job.skills ?? null,
      quantity: job.quantity ?? null,
      location: job.location ?? null,
      status: job.status,
      publishedAt: job.publishedAt ?? null,
      expiredAt: job.expiredAt ?? null,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      deletedAt: job.deletedAt ?? null,
      createdBy: job.createdBy
        ? {
            id: job.createdBy.id,
            name: job.createdBy.fullName,
            email: job.createdBy.email,
          }
        : null,
      updatedBy: job.updatedBy ?? null,
    };
  }
}
