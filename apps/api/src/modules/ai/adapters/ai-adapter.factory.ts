import { Injectable } from '@nestjs/common';
import { AiProviderVendor } from '@/modules/ai-providers/entities/ai-provider.entity';
import { AiProviderAdapter } from './ai-provider-adapter.interface';
import { AnthropicAdapter } from './anthropic.adapter';
import { OpenAiAdapter } from './openai.adapter';
import { GeminiAdapter } from './gemini.adapter';
import { GroqAdapter } from './groq.adapter';

@Injectable()
export class AiAdapterFactory {
  constructor(
    private readonly anthropicAdapter: AnthropicAdapter,
    private readonly openAiAdapter: OpenAiAdapter,
    private readonly geminiAdapter: GeminiAdapter,
    private readonly groqAdapter: GroqAdapter,
  ) {}

  getAdapter(vendor: AiProviderVendor): AiProviderAdapter {
    switch (vendor) {
      case AiProviderVendor.ANTHROPIC:
        return this.anthropicAdapter;
      case AiProviderVendor.OPENAI:
        return this.openAiAdapter;
      case AiProviderVendor.GEMINI:
        return this.geminiAdapter;
      case AiProviderVendor.GROQ:
        return this.groqAdapter;
      default:
        throw new Error(`Không hỗ trợ nhà cung cấp AI: ${String(vendor)}`);
    }
  }
}
