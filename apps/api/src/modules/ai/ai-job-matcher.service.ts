import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { ParsedCv } from '@/modules/cv/entities/parsed-cv.entity';

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

  async matchJobWithCv(
    job: JobPostEntity,
    parsedCv: ParsedCv,
  ): Promise<MatchScores> {
    const userMessage = JSON.stringify({
      job: {
        title: job.title,
        department: job.department,
        jobType: job.jobType,
        seniorityLevel: job.seniorityLevel,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities ?? null,
        skills: job.skills ?? [],
      },
      candidate: {
        currentTitle: parsedCv.currentTitle ?? null,
        totalExperienceYears: parsedCv.totalExperienceYears ?? null,
        skills: this.safeParseArray(parsedCv.skills),
        education: this.safeParseArray(parsedCv.education),
        workExperience: this.safeParseArray(parsedCv.workExperience),
        certifications: this.safeParseArray(parsedCv.certifications),
        languages: this.safeParseArray(parsedCv.languages),
      },
    });

    const raw = await this.aiService.chatWithSystem(
      this.systemPrompt,
      userMessage,
    );

    return this.parseResult(raw);
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

  private parseResult(raw: string): MatchScores {
    let jsonStr = raw.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch?.[1]) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    return {
      overallScore: Math.min(
        100,
        Math.max(0, Number(parsed.overall_score) || 0),
      ),
      skillScore: Math.min(100, Math.max(0, Number(parsed.skill_score) || 0)),
      experienceScore: Math.min(
        100,
        Math.max(0, Number(parsed.experience_score) || 0),
      ),
      educationScore: Math.min(
        100,
        Math.max(0, Number(parsed.education_score) || 0),
      ),
      titleScore: Math.min(100, Math.max(0, Number(parsed.title_score) || 0)),
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
