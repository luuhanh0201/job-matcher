import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { ParsedCv } from '@/modules/cv/entities/parsed-cv.entity';
import { AiUsageFeature } from '@/modules/ai-usage/entities/ai-usage-log.entity';

export interface MatchScores {
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  titleScore: number;
  matchedSkills: string;
  missingSkills: string;
  explanation: string;
}

@Injectable()
export class AiJobMatcherService {
  private readonly logger = new Logger(AiJobMatcherService.name);
  private readonly systemPrompt: string;

  constructor(private readonly aiService: AiService) {
    this.systemPrompt = fs.readFileSync(
      path.join(__dirname, 'prompts/Prompt-AI-job-matcher.md'),
      'utf8',
    );
  }

  /**
   * Chấm điểm NHIỀU job trong một lượt gọi AI: CV + system prompt chỉ tốn
   * token một lần thay vì lặp lại theo từng job. Kết quả trả về theo job.id;
   * job nào model bỏ sót/trả sai định dạng sẽ không có trong Map — caller tự
   * quyết định fallback.
   */
  async matchJobsWithCv(
    jobs: JobPostEntity[],
    parsedCv: ParsedCv,
  ): Promise<Map<string, MatchScores>> {
    const userMessage = JSON.stringify({
      candidate: {
        currentTitle: parsedCv.currentTitle ?? null,
        totalExperienceYears: parsedCv.totalExperienceYears ?? null,
        skills: this.safeParseArray(parsedCv.skills),
        education: this.safeParseArray(parsedCv.education),
        workExperience: this.safeParseArray(parsedCv.workExperience),
        certifications: this.safeParseArray(parsedCv.certifications),
        languages: this.safeParseArray(parsedCv.languages),
      },
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        department: job.department,
        jobType: job.jobType,
        seniorityLevel: job.seniorityLevel,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities ?? null,
        skills: job.skills ?? [],
      })),
    });

    const raw = await this.aiService.chatWithSystem(
      this.systemPrompt,
      userMessage,
      AiUsageFeature.JOB_MATCHING,
      // Output là mảng JSON điểm + explanation cho từng job — cần trần token
      // cao hơn mặc định của provider để không bị cắt giữa chừng gây lỗi parse.
      { minOutputTokens: 800 * jobs.length },
    );

    return this.parseBatchResult(raw, jobs);
  }

  private safeParseArray(value?: string): unknown[] {
    if (!value) return [];
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private parseBatchResult(
    raw: string,
    jobs: JobPostEntity[],
  ): Map<string, MatchScores> {
    let jsonStr = raw.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch?.[1]) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const parsed: unknown = JSON.parse(jsonStr);
    // Chấp nhận cả dạng mảng trực tiếp lẫn dạng bọc { results: [...] }
    const items = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as Record<string, unknown>)?.results)
        ? ((parsed as Record<string, unknown>).results as unknown[])
        : [];

    const validJobIds = new Set(jobs.map((job) => job.id));
    const results = new Map<string, MatchScores>();

    for (const item of items) {
      if (typeof item !== 'object' || item === null) continue;
      const record = item as Record<string, unknown>;
      const jobId = typeof record.job_id === 'string' ? record.job_id : null;
      if (!jobId || !validJobIds.has(jobId) || results.has(jobId)) {
        this.logger.warn(
          `Bỏ qua kết quả matching có job_id không hợp lệ/trùng: ${String(record.job_id)}`,
        );
        continue;
      }
      results.set(jobId, this.toMatchScores(record));
    }

    return results;
  }

  private toMatchScores(parsed: Record<string, unknown>): MatchScores {
    const clampScore = (value: unknown) =>
      Math.min(100, Math.max(0, Number(value) || 0));

    return {
      overallScore: clampScore(parsed.overall_score),
      skillScore: clampScore(parsed.skill_score),
      experienceScore: clampScore(parsed.experience_score),
      educationScore: clampScore(parsed.education_score),
      titleScore: clampScore(parsed.title_score),
      matchedSkills: JSON.stringify(
        Array.isArray(parsed.matched_skills) ? parsed.matched_skills : [],
      ),
      missingSkills: JSON.stringify(
        Array.isArray(parsed.missing_skills) ? parsed.missing_skills : [],
      ),
      explanation:
        typeof parsed.explanation === 'string' ? parsed.explanation : '',
    };
  }
}
