import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';
import type { Cache } from 'cache-manager';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { AiService } from './ai.service';
import { AnalyzerCvResultDto } from './dto/analyzer-cv-result.dto';
import { AnalyzeCvDto } from './dto/analyze-cv.dto';

const FALLBACK_PROMPT =
    'Bạn là AI Analyzer chuyên phân tích và đánh giá CV/resume ứng viên, Nhiệm vụ Đọc nội dung CV được cung cấp và trả về **DUY NHẤT** một JSON hợp lệ, Không thêm markdown, không giải thích, không văn bản thừa ngoài JSON';

const MAX_RETRIES = 5;
const ANALYZE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const ANALYZE_COOLDOWN_MS = 5 * 60 * 1000;

type AnalyzeIdentity = {
    userId: string;
    deviceId: string;
};

@Injectable()
export class AiAnalyzerService {
    private readonly logger = new Logger(AiAnalyzerService.name);

    constructor(
        private readonly aiService: AiService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

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

    async analyzeCv(payload: AnalyzeCvDto, identity: AnalyzeIdentity): Promise<AnalyzerCvResultDto> {
        await this.enforceAnalyzeCooldown(identity);

        const cacheKey = this.buildCacheKey(payload);
        const cached = await this.getCachedResult(cacheKey);
        if (cached) {
            this.logger.debug(`Cache hit cho analyzer key ${cacheKey}`);
            await this.markAnalyzeSuccess(identity);
            return cached;
        }

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
                const validated = await this.validateAnalyzerResult(parsed);
                await this.setCachedResult(cacheKey, validated);
                await this.markAnalyzeSuccess(identity);
                return validated;
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

    private buildAccountCooldownKey(userId: string): string {
        return `ai:analyze-cooldown:account:${userId}`;
    }

    private buildDeviceCooldownKey(deviceId: string): string {
        return `ai:analyze-cooldown:device:${deviceId}`;
    }

    private async enforceAnalyzeCooldown(identity: AnalyzeIdentity): Promise<void> {
        const [accountAt, deviceAt] = await Promise.all([
            this.getCooldownTimestamp(this.buildAccountCooldownKey(identity.userId)),
            this.getCooldownTimestamp(this.buildDeviceCooldownKey(identity.deviceId)),
        ]);

        const accountWaitSeconds = this.getWaitSeconds(accountAt);
        if (accountWaitSeconds > 0) {
            throw new HttpException(
                `Bạn chỉ được phân tích CV lại sau ${accountWaitSeconds} giây (giới hạn theo tài khoản).`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        const deviceWaitSeconds = this.getWaitSeconds(deviceAt);
        if (deviceWaitSeconds > 0) {
            throw new HttpException(
                `Thiết bị này chỉ được phân tích CV lại sau ${deviceWaitSeconds} giây.`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    private async markAnalyzeSuccess(identity: AnalyzeIdentity): Promise<void> {
        const now = Date.now();
        await Promise.all([
            this.setCooldownTimestamp(this.buildAccountCooldownKey(identity.userId), now),
            this.setCooldownTimestamp(this.buildDeviceCooldownKey(identity.deviceId), now),
        ]);
    }

    private getWaitSeconds(timestamp: number | null): number {
        if (!timestamp) {
            return 0;
        }

        const elapsed = Date.now() - timestamp;
        if (elapsed >= ANALYZE_COOLDOWN_MS) {
            return 0;
        }

        return Math.ceil((ANALYZE_COOLDOWN_MS - elapsed) / 1000);
    }

    private async getCooldownTimestamp(key: string): Promise<number | null> {
        try {
            const value = await this.cacheManager.get<number>(key);
            return typeof value === 'number' ? value : null;
        } catch (error) {
            this.logger.warn(
                `Không thể đọc cooldown analyzer: ${error instanceof Error ? error.message : 'lỗi không xác định'}`,
            );
            return null;
        }
    }

    private async setCooldownTimestamp(key: string, timestamp: number): Promise<void> {
        try {
            await this.cacheManager.set(key, timestamp, ANALYZE_COOLDOWN_MS);
        } catch (error) {
            this.logger.warn(
                `Không thể ghi cooldown analyzer: ${error instanceof Error ? error.message : 'lỗi không xác định'}`,
            );
        }
    }

    private buildUserMessage(payload: AnalyzeCvDto): string {
        return `Input CV JSON:\n${JSON.stringify(payload, null, 2)}`;
    }

    private buildCacheKey(payload: AnalyzeCvDto): string {
        const canonicalPayload = this.stableStringify(payload);
        const digest = createHash('sha256').update(canonicalPayload).digest('hex');
        return `ai:analyze-cv:${digest}`;
    }

    private stableStringify(value: unknown): string {
        if (Array.isArray(value)) {
            return `[${value.map((item) => this.stableStringify(item)).join(',')}]`;
        }

        if (value && typeof value === 'object') {
            const obj = value as Record<string, unknown>;
            const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
            return `{${keys
                .map((key) => `${JSON.stringify(key)}:${this.stableStringify(obj[key])}`)
                .join(',')}}`;
        }

        return JSON.stringify(value);
    }

    private async getCachedResult(key: string): Promise<AnalyzerCvResultDto | null> {
        try {
            return (await this.cacheManager.get<AnalyzerCvResultDto>(key)) ?? null;
        } catch (error) {
            this.logger.warn(
                `Không thể đọc cache analyzer: ${error instanceof Error ? error.message : 'lỗi không xác định'}`,
            );
            return null;
        }
    }

    private async setCachedResult(
        key: string,
        value: AnalyzerCvResultDto,
    ): Promise<void> {
        try {
            await this.cacheManager.set(key, value, ANALYZE_CACHE_TTL_MS);
        } catch (error) {
            this.logger.warn(
                `Không thể ghi cache analyzer: ${error instanceof Error ? error.message : 'lỗi không xác định'}`,
            );
        }
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
