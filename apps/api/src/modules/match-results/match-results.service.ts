import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchResult } from './entities/match-result.entity';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { ParsedCv } from '@/modules/cv/entities/parsed-cv.entity';
import { AiJobMatcherService } from '@/modules/ai/ai-job-matcher.service';
import { JobPostStatus } from '@/common/enum/Job.enum';
import {
  PaginationQueryDto,
  toPaginatedResult,
} from '@/common/dto/pagination-query.dto';

@Injectable()
export class MatchResultsService {
  private readonly logger = new Logger(MatchResultsService.name);

  constructor(
    @InjectRepository(MatchResult)
    private readonly matchResultRepository: Repository<MatchResult>,
    @InjectRepository(JobPostEntity)
    private readonly jobRepository: Repository<JobPostEntity>,
    @InjectRepository(ParsedCv)
    private readonly parsedCvRepository: Repository<ParsedCv>,
    private readonly aiJobMatcherService: AiJobMatcherService,
  ) {}

  async runMatchingForParsedCv(parsedCvId: string): Promise<void> {
    try {
      const parsedCv = await this.parsedCvRepository.findOneBy({
        id: parsedCvId,
      });
      if (!parsedCv) {
        this.logger.warn(`ParsedCv ${parsedCvId} not found, skipping matching`);
        return;
      }

      const jobs = await this.jobRepository.find({
        where: { status: JobPostStatus.OPEN },
        order: { publishedAt: 'DESC' },
        take: 20,
      });

      if (jobs.length === 0) {
        this.logger.log('No open jobs found for matching');
        return;
      }

      this.logger.log(
        `Running matching for parsedCv ${parsedCvId} against ${jobs.length} jobs`,
      );

      const matchResults = await Promise.all(
        jobs.map((job) => this.scoreOneJob(job, parsedCv)),
      );

      // Xoá kết quả matching cũ của parsedCv trước khi lưu batch mới để
      // tránh trùng lặp khi hàm này được gọi nhiều lần liên tiếp (race condition).
      await this.matchResultRepository.delete({ parsedCv: { id: parsedCvId } });

      for (const { job, scores } of matchResults) {
        const result = this.matchResultRepository.create({
          job,
          parsedCv,
          overallScore: scores.overallScore,
          skillScore: scores.skillScore,
          experienceScore: scores.experienceScore,
          educationScore: scores.educationScore,
          titleScore: scores.titleScore,
          matchedSkills: scores.matchedSkills,
          missingSkills: scores.missingSkills,
          explanation: scores.explanation,
        });
        await this.matchResultRepository.save(result);
      }

      this.logger.log(
        `Matching complete for parsedCv ${parsedCvId}: ${matchResults.length} results saved`,
      );
    } catch (error) {
      this.logger.error(`Matching failed for parsedCv ${parsedCvId}`, error);
    }
  }

  private async scoreOneJob(job: JobPostEntity, parsedCv: ParsedCv) {
    try {
      const scores = await this.aiJobMatcherService.matchJobWithCv(
        job,
        parsedCv,
      );
      return { job, scores };
    } catch (error) {
      this.logger.warn(
        `AI matching failed for job ${job.id}: ${String(error)}`,
      );
      return {
        job,
        scores: {
          overallScore: 0,
          skillScore: 0,
          experienceScore: 0,
          educationScore: 0,
          titleScore: 0,
          matchedSkills: '[]',
          missingSkills: '[]',
          explanation: 'Không thể phân tích kết quả do lỗi hệ thống.',
        },
      };
    }
  }

  async getMyMatchResults(userId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.matchResultRepository
      .createQueryBuilder('match')
      .innerJoinAndSelect('match.job', 'job')
      .innerJoinAndSelect('match.parsedCv', 'parsedCv')
      .innerJoinAndSelect('parsedCv.cv', 'cv')
      .where('cv.userId = :userId', { userId })
      .andWhere('job.status = :openStatus', {
        openStatus: JobPostStatus.OPEN,
      })
      .andWhere('(job.expiredAt IS NULL OR job.expiredAt > now())');

    if (query.keyword?.trim()) {
      qb.andWhere(
        `(unaccent(job.title) ILIKE unaccent(:kw)
          OR unaccent(job.department) ILIKE unaccent(:kw))`,
        { kw: `%${query.keyword.trim()}%` },
      );
    }

    const [results, total] = await qb
      .orderBy('match.overallScore', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return toPaginatedResult(
      results.map((r) => this.toResponse(r)),
      total,
      page,
      limit,
    );
  }

  private toResponse(match: MatchResult) {
    const safeParseArray = (s: string): string[] => {
      try {
        const parsed: unknown = JSON.parse(s);
        return Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        return [];
      }
    };

    return {
      id: match.id,
      overallScore: match.overallScore,
      skillScore: match.skillScore,
      experienceScore: match.experienceScore,
      educationScore: match.educationScore,
      titleScore: match.titleScore,
      matchedSkills: safeParseArray(match.matchedSkills),
      missingSkills: safeParseArray(match.missingSkills),
      explanation: match.explanation,
      matchedAt: match.matchedAt,
      job: {
        id: match.job.id,
        title: match.job.title,
        department: match.job.department,
        jobType: match.job.jobType,
        workMode: match.job.workMode,
        salaryType: match.job.salaryType,
        salaryMin: match.job.salaryMin ?? null,
        salaryMax: match.job.salaryMax ?? null,
        currency: match.job.currency,
        seniorityLevel: match.job.seniorityLevel,
        skills: match.job.skills ?? [],
        expiredAt: match.job.expiredAt ?? null,
      },
    };
  }
}
