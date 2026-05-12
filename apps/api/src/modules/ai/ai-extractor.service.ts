import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AiService } from './ai.service';
import { ExtractedCvDto } from '@/modules/cv/dto/extracted-cv.dto';

type ExtractedEducation = {
    school: string;
    degree: string;
    major: string;
    time: string;
};

type ExtractedWorkExperience = {
    company: string;
    position: string;
    time: string;
    description: string;
};

export type ExtractedCvData = {
    candidateName: string;
    currentTitle: string;
    email: string;
    phone: string;
    totalExperienceYears: string;
    skills: string[];
    education: ExtractedEducation[];
    workExperience: ExtractedWorkExperience[];
    certifications: string[];
    languages: string[];
};

const MAX_RETRIES = 3;

const FALLBACK_PROMPT =
    'Bạn là AI Extractor chuyên trích xuất thông tin từ CV/resume ứng viên, Nhiệm vụ Đọc nội dung CV được cung cấp và trả về **DUY NHẤT** một JSON hợp lệ, Không thêm markdown, không giải thích, không văn bản thừa ngoài JSON';

@Injectable()
export class AiExtractorService {
    private readonly logger = new Logger(AiExtractorService.name);
    private readonly systemPrompt: string;

    constructor(private readonly aiService: AiService) {
        this.systemPrompt = this.loadSystemPrompt();
    }

    async extractCv(cvText: string): Promise<ExtractedCvData> {
        if (!cvText?.trim()) {
            throw new BadRequestException('cvText is required');
        }

        let lastError: unknown;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
            try {
                const rawResponse = await this.aiService.chatWithSystem(
                    this.systemPrompt,
                    this.buildUserMessage(cvText),
                );

                const parsed = this.parseJsonResponse(rawResponse);
                const normalized = this.normalizeParsedData(parsed);
                return await this.validateExtractedCvData(normalized);
            } catch (error) {
                lastError = error;
                this.logger.warn(
                    `Lần thử trích xuất CV ${attempt}/${MAX_RETRIES} thất bại: ${error instanceof Error ? error.message : 'lỗi không xác định'
                    }`,
                );
            }
        }

        this.logger.error('Trích xuất CV thất bại sau số lần thử tối đa', lastError as Error);
        throw new InternalServerErrorException(
            `Không thể trích xuất CV. Vui lòng kiểm tra lại nội dung CV hoặc thử lại sau.`,
        );
    }

    private loadSystemPrompt(): string {
        try {
            const promptPath = join(
                process.cwd(),
                'src',
                'modules',
                'ai',
                'prompts',
                'Prompt-AI-extractor.md',
            );
            return readFileSync(promptPath, 'utf8').trim();
        } catch (error) {
            this.logger.warn(
                `Không thể đọc file promt-AI-extractor.md, sử dụng fallback prompt: ${error instanceof Error ? error.message : 'lỗi không xác định'
                }`,
            );
            return FALLBACK_PROMPT;
        }
    }

    private buildUserMessage(cvText: string): string {
        return `Input CV:\n${cvText}`;
    }

    private parseJsonResponse(rawResponse: string): unknown {
        const cleaned = this.stripCodeFence(rawResponse);

        try {
            return JSON.parse(cleaned);
        } catch {
            throw new Error('Phản hồi của AI không phải là JSON hợp lệ');
        }
    }

    private stripCodeFence(text: string): string {
        const trimmed = text.trim();
        if (!trimmed.startsWith('```')) {
            return trimmed;
        }

        return trimmed
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/, '')
            .trim();
    }

    private normalizeParsedData(payload: unknown): ExtractedCvData {
        const data = this.asRecord(payload);

        return {
            candidateName: this.asString(data['candidateName']),
            currentTitle: this.asString(data['currentTitle']),
            email: this.asString(data['email']).toLowerCase(),
            phone: this.asString(data['phone']),
            totalExperienceYears: this.asString(data['totalExperienceYears']),
            skills: this.asStringArray(data['skills']),
            education: this.normalizeEducation(data['education']),
            workExperience: this.normalizeWorkExperience(data['workExperience']),
            certifications: this.asStringArray(data['certifications']),
            languages: this.asStringArray(data['languages']),
        };
    }

    private async validateExtractedCvData(
        payload: ExtractedCvData,
    ): Promise<ExtractedCvData> {
        const dto = plainToInstance(ExtractedCvDto, payload);
        const errors = await validate(dto, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });

        if (errors.length > 0) {
            throw new Error(
                `Dữ liệu CV sau khi trích xuất không hợp lệ: ${this.formatValidationErrors(errors)}`,
            );
        }

        return dto as ExtractedCvData;
    }

    private formatValidationErrors(errors: ValidationError[]): string {
        return errors
            .flatMap((error) => {
                const current = Object.values(error.constraints ?? {});
                const nested = (error.children ?? []).flatMap((child) =>
                    Object.values(child.constraints ?? {}),
                );
                return [...current, ...nested];
            })
            .join('; ');
    }

    private normalizeEducation(input: unknown): ExtractedEducation[] {
        if (!Array.isArray(input)) {
            return [];
        }

        return input.map((item) => {
            const row = this.asRecord(item);
            return {
                school: this.asString(row['school']),
                degree: this.asString(row['degree']),
                major: this.asString(row['major']),
                time: this.asString(row['time']),
            };
        });
    }

    private normalizeWorkExperience(input: unknown): ExtractedWorkExperience[] {
        if (!Array.isArray(input)) {
            return [];
        }

        return input.map((item) => {
            const row = this.asRecord(item);
            return {
                company: this.asString(row['company']),
                position: this.asString(row['position']),
                time: this.asString(row['time']),
                description: this.asString(row['description']),
            };
        });
    }

    private asRecord(value: unknown): Record<string, unknown> {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return {};
        }
        return value as Record<string, unknown>;
    }

    private asString(value: unknown): string {
        return typeof value === 'string' ? value.trim() : '';
    }

    private asStringArray(value: unknown): string[] {
        if (!Array.isArray(value)) {
            return [];
        }

        return value
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter((item) => item.length > 0);
    }
}
