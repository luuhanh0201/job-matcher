import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchResult } from './entities/match-result.entity';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { ParsedCv } from '@/modules/cv/entities/parsed-cv.entity';
import {
  AiJobMatcherService,
  MatchScores,
} from '@/modules/ai/ai-job-matcher.service';
import { JobPostStatus } from '@/common/enum/Job.enum';
import { CompanyStatus } from '@/modules/company/entity/company.entity';
import {
  PaginationQueryDto,
  toPaginatedResult,
} from '@/common/dto/pagination-query.dto';

// Số job tối đa đưa qua AI chấm điểm cho mỗi CV — đã được lọc thô bằng SQL
// (skill overlap) trước nên không cần lấy nhiều như trước (20 job mới nhất).
const MATCH_JOB_LIMIT = 10;

// Số job gộp vào MỘT request AI. Giữ vừa phải để output JSON (điểm +
// explanation cho từng job) không quá dài gây lỗi parse/truncate.
const MATCH_AI_BATCH_SIZE = 5;

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

  // Lỗi bất ngờ được ném ra ngoài để BullMQ retry theo cấu hình queue;
  // lỗi AI theo từng lô đã có fallback 0 điểm trong scoreJobsBatch.
  async runMatchingForParsedCv(parsedCvId: string): Promise<void> {
    const parsedCv = await this.parsedCvRepository.findOneBy({
      id: parsedCvId,
    });
    if (!parsedCv) {
      this.logger.warn(`ParsedCv ${parsedCvId} not found, skipping matching`);
      return;
    }

    const jobs = await this.findCandidateJobsForMatching(parsedCv);

    if (jobs.length === 0) {
      this.logger.log('No open jobs found for matching');
      return;
    }

    this.logger.log(
      `Running matching for parsedCv ${parsedCvId} against ${jobs.length} jobs`,
    );

    // Gộp nhiều job vào 1 request AI (CV + system prompt chỉ tốn token 1 lần)
    const batches: JobPostEntity[][] = [];
    for (let i = 0; i < jobs.length; i += MATCH_AI_BATCH_SIZE) {
      batches.push(jobs.slice(i, i + MATCH_AI_BATCH_SIZE));
    }
    const matchResults = (
      await Promise.all(
        batches.map((batch) => this.scoreJobsBatch(batch, parsedCv)),
      )
    ).flat();

    const entities = matchResults.map(({ job, scores }) =>
      this.toMatchResultEntity(job, parsedCv, scores),
    );

    // Xoá kết quả cũ + lưu batch mới trong 1 transaction: tránh trùng lặp khi
    // hàm được gọi nhiều lần liên tiếp và không có khoảnh khắc candidate trắng kết quả.
    await this.matchResultRepository.manager.transaction(async (manager) => {
      await manager.delete(MatchResult, { parsedCv: { id: parsedCvId } });
      await manager.save(entities);
    });

    this.logger.log(
      `Matching complete for parsedCv ${parsedCvId}: ${matchResults.length} results saved`,
    );
  }

  // Số CV gần nhất được chấm với một job vừa OPEN (matching theo sự kiện).
  private static readonly NEW_JOB_CV_LIMIT = 10;

  /**
   * Matching theo sự kiện: job vừa chuyển OPEN được chấm với các CV parse gần
   * nhất, để candidate thấy job mới trong "Công việc phù hợp" mà không cần
   * re-upload CV. Chạy tuần tự từng CV để không bùng nổ request AI; CV chấm
   * lỗi chỉ ghi log và bỏ qua (không ghi điểm 0 vì đây là bổ sung tăng dần).
   */
  async runMatchingForNewJob(jobPostId: string): Promise<void> {
    const job = await this.jobRepository.findOne({
      where: { id: jobPostId, status: JobPostStatus.OPEN },
      relations: { company: true },
    });
    if (
      !job ||
      job.company?.status !== CompanyStatus.ACTIVE ||
      (job.expiredAt && job.expiredAt <= new Date())
    ) {
      this.logger.log(
        `Job ${jobPostId} không còn đủ điều kiện matching, bỏ qua`,
      );
      return;
    }

    const parsedCvs = await this.parsedCvRepository.find({
      order: { parsedAt: 'DESC' },
      take: MatchResultsService.NEW_JOB_CV_LIMIT,
    });
    if (parsedCvs.length === 0) return;

    this.logger.log(
      `Matching job mới ${jobPostId} với ${parsedCvs.length} CV gần nhất`,
    );

    for (const parsedCv of parsedCvs) {
      try {
        const scoresByJobId = await this.aiJobMatcherService.matchJobsWithCv(
          [job],
          parsedCv,
        );
        const scores = scoresByJobId.get(job.id);
        if (!scores) continue;

        const entity = this.toMatchResultEntity(job, parsedCv, scores);
        await this.matchResultRepository.manager.transaction(
          async (manager) => {
            await manager.delete(MatchResult, {
              job: { id: job.id },
              parsedCv: { id: parsedCv.id },
            });
            await manager.save(entity);
          },
        );
      } catch (error) {
        this.logger.warn(
          `Matching job ${jobPostId} với parsedCv ${parsedCv.id} thất bại: ${String(error)}`,
        );
      }
    }
  }

  private toMatchResultEntity(
    job: JobPostEntity,
    parsedCv: ParsedCv,
    scores: MatchScores,
  ): MatchResult {
    return this.matchResultRepository.create({
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
  }

  /**
   * Lọc thô bằng SQL trước khi gọi AI: ưu tiên job có skill trùng với CV
   * (không phân biệt hoa thường/dấu, dùng GIN index trên job_posts.skills),
   * loại job hết hạn và job của công ty chưa được duyệt. Nếu ít job trùng
   * skill thì phần còn lại tự bù bằng job mới nhất (ORDER BY phụ) — user mới
   * hoặc skill hiếm vẫn có kết quả.
   */
  private async findCandidateJobsForMatching(
    parsedCv: ParsedCv,
  ): Promise<JobPostEntity[]> {
    const skills = this.safeParseStringArray(parsedCv.skills)
      .map((skill) => skill.trim())
      .filter(Boolean)
      .slice(0, 30);

    const qb = this.jobRepository
      .createQueryBuilder('job')
      .innerJoin('job.company', 'company')
      .where('job.status = :open', { open: JobPostStatus.OPEN })
      .andWhere('(job.expired_at IS NULL OR job.expired_at > NOW())')
      .andWhere('company.status = :companyStatus', {
        companyStatus: CompanyStatus.ACTIVE,
      });

    if (skills.length > 0) {
      const skillMatchExpr = `(
        SELECT COUNT(*) FROM jsonb_array_elements_text(COALESCE(job.skills, '[]'::jsonb)) elem
        WHERE ${skills
          .map((_, index) => `unaccent(elem) ILIKE unaccent(:skill${index})`)
          .join(' OR ')}
      )`;
      qb.addSelect(skillMatchExpr, 'skill_matches')
        .setParameters(
          Object.fromEntries(
            skills.map((skill, index) => [`skill${index}`, skill]),
          ),
        )
        // Với take(), ORDER BY phải là property path hoặc alias có trong SELECT
        .orderBy('skill_matches', 'DESC')
        .addOrderBy('job.publishedAt', 'DESC', 'NULLS LAST');
    } else {
      qb.orderBy('job.publishedAt', 'DESC', 'NULLS LAST');
    }

    return qb.take(MATCH_JOB_LIMIT).getMany();
  }

  private safeParseStringArray(value?: string): string[] {
    if (!value) return [];
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  }

  /**
   * Chấm một lô job bằng một lượt gọi AI. Lô lỗi hoặc job bị model bỏ sót
   * nhận điểm 0 kèm explanation lỗi — giữ nguyên hành vi fallback cũ.
   */
  private async scoreJobsBatch(jobs: JobPostEntity[], parsedCv: ParsedCv) {
    let scoresByJobId = new Map<string, MatchScores>();
    try {
      scoresByJobId = await this.aiJobMatcherService.matchJobsWithCv(
        jobs,
        parsedCv,
      );
    } catch (error) {
      this.logger.warn(
        `AI matching failed for batch of ${jobs.length} jobs: ${String(error)}`,
      );
    }

    return jobs.map((job) => ({
      job,
      scores:
        scoresByJobId.get(job.id) ??
        ({
          overallScore: 0,
          skillScore: 0,
          experienceScore: 0,
          educationScore: 0,
          titleScore: 0,
          matchedSkills: '[]',
          missingSkills: '[]',
          explanation: 'Không thể phân tích kết quả do lỗi hệ thống.',
        } satisfies MatchScores),
    }));
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
