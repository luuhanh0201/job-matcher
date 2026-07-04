import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationQueryDto,
  toPaginatedResult,
} from '@/common/dto/pagination-query.dto';
import { JobPostStatus } from '@/common/enum/Job.enum';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { JobPostResponseDto } from '@/modules/jobs/dto/job-response.dto';
import { JobsService } from '@/modules/jobs/jobs.service';
import { User } from '@/modules/user/entities/user.entity';
import { SavedJobEntity } from './entities/saved-job.entity';
import { SavedJobResponseDto } from './dto/saved-job-response.dto';

@Injectable()
export class SavedJobsService {
  constructor(
    @InjectRepository(SavedJobEntity)
    private readonly savedJobRepository: Repository<SavedJobEntity>,
    @InjectRepository(JobPostEntity)
    private readonly jobPostRepository: Repository<JobPostEntity>,
    private readonly jobsService: JobsService,
  ) {}

  async save(jobId: string, user: User): Promise<SavedJobResponseDto> {
    const job = await this.jobPostRepository.findOne({
      where: { id: jobId, status: JobPostStatus.OPEN },
    });
    if (!job) {
      throw new BadRequestException(
        'Tin tuyển dụng không tồn tại hoặc đã đóng',
      );
    }

    const existing = await this.savedJobRepository.findOne({
      where: { candidateId: user.id, jobId },
    });
    if (existing) {
      return { jobId, saved: true, savedAt: existing.createdAt };
    }

    const savedJob = await this.savedJobRepository.save(
      this.savedJobRepository.create({ candidateId: user.id, jobId }),
    );
    return { jobId, saved: true, savedAt: savedJob.createdAt };
  }

  async unsave(jobId: string, user: User): Promise<SavedJobResponseDto> {
    await this.savedJobRepository.delete({ candidateId: user.id, jobId });
    return { jobId, saved: false, savedAt: null };
  }

  async findMySavedJobs(
    user: User,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<JobPostResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.savedJobRepository
      .createQueryBuilder('saved')
      .innerJoinAndSelect('saved.job', 'job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.createdBy', 'createdBy')
      .where('saved.candidate_id = :userId', { userId: user.id });

    if (query.keyword?.trim()) {
      qb.andWhere(
        `(unaccent(job.title) ILIKE unaccent(:kw)
          OR unaccent(company.name) ILIKE unaccent(:kw))`,
        { kw: `%${query.keyword.trim()}%` },
      );
    }

    const [savedJobs, total] = await qb
      .orderBy('saved.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return toPaginatedResult(
      savedJobs.map((saved) => this.jobsService.toJobPostResponse(saved.job)),
      total,
      page,
      limit,
    );
  }

  async findMySavedJobIds(user: User): Promise<string[]> {
    const savedJobs = await this.savedJobRepository.find({
      where: { candidateId: user.id },
      select: { jobId: true },
    });
    return savedJobs.map((saved) => saved.jobId);
  }
}
