import { Module } from '@nestjs/common';
import { AiAdapterFactory } from './ai-adapter.factory';
import { AnthropicAdapter } from './anthropic.adapter';
import { OpenAiAdapter } from './openai.adapter';
import { GeminiAdapter } from './gemini.adapter';
import { GroqAdapter } from './groq.adapter';

@Module({
  providers: [
    AiAdapterFactory,
    AnthropicAdapter,
    OpenAiAdapter,
    GeminiAdapter,
    GroqAdapter,
  ],
  exports: [AiAdapterFactory],
})
export class AiAdaptersModule {}
