import Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import {
  AiAdapterCallOptions,
  AiCallResult,
  AiChatMessage,
  AiProviderAdapter,
} from './ai-provider-adapter.interface';

@Injectable()
export class AnthropicAdapter implements AiProviderAdapter {
  async chat(
    userMessage: string,
    options: AiAdapterCallOptions,
  ): Promise<AiCallResult> {
    const client = new Anthropic({ apiKey: options.apiKey });
    const response = await client.messages.create({
      model: options.model,
      max_tokens: options.maxTokens,
      messages: [{ role: 'user', content: userMessage }],
    });

    return this.toResult(response);
  }

  async chatWithSystem(
    systemPrompt: string,
    userMessage: string,
    options: AiAdapterCallOptions,
  ): Promise<AiCallResult> {
    const client = new Anthropic({ apiKey: options.apiKey });
    const response = await client.messages.create({
      model: options.model,
      max_tokens: options.maxTokens,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    });

    return this.toResult(response);
  }

  async multiTurnChat(
    messages: AiChatMessage[],
    options: AiAdapterCallOptions,
  ): Promise<AiCallResult> {
    const client = new Anthropic({ apiKey: options.apiKey });
    const response = await client.messages.create({
      model: options.model,
      max_tokens: options.maxTokens,
      messages,
    });

    return this.toResult(response);
  }

  private toResult(response: Anthropic.Message): AiCallResult {
    const block = response.content[0];
    if (block?.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic API');
    }

    // Cộng cả token đọc/ghi cache vào input để thống kê phản ánh đúng khối lượng
    // xử lý thực tế (token đọc từ cache được tính phí ~0.1x nhưng vẫn là input).
    const usage = response.usage;
    const cachedTokens =
      (usage.cache_read_input_tokens ?? 0) +
      (usage.cache_creation_input_tokens ?? 0);

    return {
      text: block.text,
      usage: {
        inputTokens: usage.input_tokens + cachedTokens,
        outputTokens: usage.output_tokens,
      },
    };
  }
}
