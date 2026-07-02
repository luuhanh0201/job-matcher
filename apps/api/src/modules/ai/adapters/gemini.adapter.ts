import {
  GenerateContentResult,
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import {
  AiAdapterCallOptions,
  AiCallResult,
  AiChatMessage,
  AiProviderAdapter,
} from './ai-provider-adapter.interface';

@Injectable()
export class GeminiAdapter implements AiProviderAdapter {
  async chat(
    userMessage: string,
    options: AiAdapterCallOptions,
  ): Promise<AiCallResult> {
    const model = this.buildModel(options);
    const result = await model.generateContent(userMessage);
    return this.toResult(result);
  }

  async chatWithSystem(
    systemPrompt: string,
    userMessage: string,
    options: AiAdapterCallOptions,
  ): Promise<AiCallResult> {
    const model = this.buildModel(options, systemPrompt);
    const result = await model.generateContent(userMessage);
    return this.toResult(result);
  }

  async multiTurnChat(
    messages: AiChatMessage[],
    options: AiAdapterCallOptions,
  ): Promise<AiCallResult> {
    const model = this.buildModel(options);
    const history = messages.slice(0, -1).map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));
    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    return this.toResult(result);
  }

  private buildModel(
    options: AiAdapterCallOptions,
    systemInstruction?: string,
  ) {
    const client = new GoogleGenerativeAI(options.apiKey);
    return client.getGenerativeModel({
      model: options.model,
      systemInstruction,
      generationConfig: { maxOutputTokens: options.maxTokens },
    });
  }

  private toResult(result: GenerateContentResult): AiCallResult {
    const usageMetadata = result.response.usageMetadata;
    return {
      text: result.response.text(),
      usage: {
        inputTokens: usageMetadata?.promptTokenCount ?? 0,
        outputTokens: usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  }
}
