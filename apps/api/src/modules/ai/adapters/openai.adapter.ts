import OpenAI from 'openai';
import { Injectable } from '@nestjs/common';
import {
  AiAdapterCallOptions,
  AiCallResult,
  AiChatMessage,
  AiProviderAdapter,
} from './ai-provider-adapter.interface';

@Injectable()
export class OpenAiAdapter implements AiProviderAdapter {
  async chat(
    userMessage: string,
    options: AiAdapterCallOptions,
  ): Promise<AiCallResult> {
    const client = new OpenAI({ apiKey: options.apiKey });
    const response = await client.chat.completions.create({
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
    const client = new OpenAI({ apiKey: options.apiKey });
    const response = await client.chat.completions.create({
      model: options.model,
      max_tokens: options.maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    return this.toResult(response);
  }

  async multiTurnChat(
    messages: AiChatMessage[],
    options: AiAdapterCallOptions,
  ): Promise<AiCallResult> {
    const client = new OpenAI({ apiKey: options.apiKey });
    const response = await client.chat.completions.create({
      model: options.model,
      max_tokens: options.maxTokens,
      messages,
    });

    return this.toResult(response);
  }

  private toResult(response: OpenAI.Chat.ChatCompletion): AiCallResult {
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Unexpected response type from OpenAI API');
    }

    return {
      text: content,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }
}
