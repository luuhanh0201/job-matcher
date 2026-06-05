import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPostEntity } from './entities/job.entity';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { User } from '../user/entities/user.entity';
import { CompanyEntity } from '../company/entity/company.entity';
import { JobPostResponseDto } from './dto/job-response.dto';
import { JobPostStatus, SalaryType } from '@/common/enum/Job.enum';
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

  async findAll(): Promise<JobPostResponseDto[]> {
    const jobs = await this.jobPostRepository.find({
      relations: {
        company: true,
        createdBy: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return jobs.map((job) => this.toJobPostResponse(job));
  }

  async findOne(id: string): Promise<JobPostResponseDto> {
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
    return this.toJobPostResponse(job);
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

    job.status = status;
    if (status === JobPostStatus.OPEN && !job.publishedAt) {
      job.publishedAt = new Date();
    }

    const savedJob = await this.jobPostRepository.save(job);
    return this.toJobPostResponse(savedJob);
  }

  private toJobPostResponse(job: JobPostEntity): JobPostResponseDto {
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
