import { EmbedContentRequest, GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMBEDDING_DIM } from './embedding-text.util';

// Cắt bớt input rất dài để tránh vượt giới hạn token của model embedding.
const MAX_INPUT_CHARS = 8000;
// gemini-embedding-001 mặc định 3072 chiều nhưng hỗ trợ cắt (MRL) về 768 —
// khớp cột vector(768). Cosine distance (<=>) bất biến theo độ dài nên không
// cần chuẩn hoá lại vector sau khi cắt.
const DEFAULT_EMBEDDING_MODEL = 'gemini-embedding-001';

/**
 * Sinh embedding bằng Gemini (model text-embedding-004, 768 chiều). Dùng key từ
 * env GEMINI_API_KEY — độc lập với "AI provider đang active" (Anthropic/Groq
 * không có embedding API). Mọi lỗi đều trả null thay vì ném: matching sẽ tự
 * fallback sang lọc theo skill nên không bao giờ bị chặn bởi lỗi embedding.
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly apiKey?: string;
  private readonly model: string;
  private warnedMissingKey = false;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('GEMINI_API_KEY') || undefined;
    this.model =
      this.config.get<string>('GEMINI_EMBEDDING_MODEL') ??
      DEFAULT_EMBEDDING_MODEL;
  }

  get isEnabled(): boolean {
    return Boolean(this.apiKey);
  }

  async embed(text: string): Promise<number[] | null> {
    if (!this.apiKey) {
      if (!this.warnedMissingKey) {
        this.logger.warn(
          'GEMINI_API_KEY chưa cấu hình — bỏ qua sinh embedding, matching dùng lọc skill.',
        );
        this.warnedMissingKey = true;
      }
      return null;
    }

    const input = text?.trim();
    if (!input) return null;

    try {
      const client = new GoogleGenerativeAI(this.apiKey);
      const model = client.getGenerativeModel({ model: this.model });
      // outputDimensionality có ở API nhưng chưa được khai báo trong type của SDK.
      const request: EmbedContentRequest & { outputDimensionality?: number } = {
        content: {
          role: 'user',
          parts: [{ text: input.slice(0, MAX_INPUT_CHARS) }],
        },
        outputDimensionality: EMBEDDING_DIM,
      };
      const result = await model.embedContent(request);
      const values = result.embedding?.values;

      if (!Array.isArray(values) || values.length !== EMBEDDING_DIM) {
        this.logger.warn(
          `Embedding trả về số chiều không hợp lệ (${
            values?.length ?? 0
          }, cần ${EMBEDDING_DIM}) — bỏ qua.`,
        );
        return null;
      }

      return values;
    } catch (error) {
      this.logger.warn(
        `Sinh embedding thất bại: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
