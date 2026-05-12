import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AiService } from './ai.service';
import { AnalyzerCvResultDto } from './dto/analyzer-cv-result.dto';
import { AnalyzeCvDto } from './dto/analyze-cv.dto';

const FALLBACK_PROMPT =
    'Bạn là AI Analyzer chuyên phân tích và đánh giá CV/resume ứng viên, Nhiệm vụ Đọc nội dung CV được cung cấp và trả về **DUY NHẤT** một JSON hợp lệ, Không thêm markdown, không giải thích, không văn bản thừa ngoài JSON';

const MAX_RETRIES = 5;
@Injectable()
export class AiAnalyzerService {
    private readonly logger = new Logger(AiAnalyzerService.name);

    constructor(private readonly aiService: AiService) { }

    private loadSystemPrompt(): string {
        try {
            const promptPath = join(
                process.cwd(),
                'src',
                'modules',
                'ai',
                'prompts',
                'Prompt-AI-analyzer.md',
            );
            return readFileSync(promptPath, 'utf8').trim();
        } catch (error) {
            this.logger.warn(
                `Không thể đọc file Prompt-AI-analyzer.md, sử dụng fallback prompt: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
            );
            return FALLBACK_PROMPT;
        }
    }

    async getSystemPrompt(): Promise<string> {
        return this.loadSystemPrompt();
    }

    async analyzeCv(payload: AnalyzeCvDto): Promise<AnalyzerCvResultDto> {
        const systemPrompt = await this.getSystemPrompt();
        const userMessage = this.buildUserMessage(payload);
        let lastError: unknown;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
            try {
                const rawResponse = await this.aiService.chatWithSystem(
                    systemPrompt,
                    userMessage,
                );
                const parsed = this.parseJsonResponse(rawResponse);
                return await this.validateAnalyzerResult(parsed);
            } catch (error) {
                lastError = error;
                this.logger.warn(
                    `Lần thử phân tích CV ${attempt}/${MAX_RETRIES} thất bại: ${error instanceof Error ? error.message : 'lỗi không xác định'}`,
                );
            }
        }

        this.logger.error(
            'Phân tích CV thất bại sau số lần thử tối đa',
            lastError as Error,
        );
        throw new InternalServerErrorException(
            'Không thể phân tích CV. Vui lòng thử lại sau.',
        );
    }

    private buildUserMessage(payload: AnalyzeCvDto): string {
        return `Input CV JSON:\n${JSON.stringify(payload, null, 2)}`;
    }

    private parseJsonResponse(rawResponse: string): unknown {
        const cleaned = this.stripCodeFence(rawResponse);

        try {
            return JSON.parse(cleaned);
        } catch {
            throw new Error('Phản hồi của AI Analyzer không phải JSON hợp lệ');
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

    private async validateAnalyzerResult(payload: unknown): Promise<AnalyzerCvResultDto> {
        const dto = plainToInstance(AnalyzerCvResultDto, payload);
        const errors = await validate(dto, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });

        if (errors.length > 0) {
            throw new Error(
                `Kết quả AI Analyzer không hợp lệ: ${this.formatValidationErrors(errors)}`,
            );
        }

        return dto;
    }

    private formatValidationErrors(errors: ValidationError[]): string {
        const walk = (items: ValidationError[]): string[] =>
            items.flatMap((item) => [
                ...Object.values(item.constraints ?? {}),
                ...walk(item.children ?? []),
            ]);

        return walk(errors).join('; ');
    }
}
