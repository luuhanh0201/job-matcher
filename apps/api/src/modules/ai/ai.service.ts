import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AiProvidersService } from '@/modules/ai-providers/ai-providers.service';
import { AiUsageLogsService } from '@/modules/ai-usage/ai-usage-logs.service';
import { AiUsageFeature } from '@/modules/ai-usage/entities/ai-usage-log.entity';
import { AiAdapterFactory } from './adapters/ai-adapter.factory';
import {
  AiChatMessage,
  AiProviderAdapter,
} from './adapters/ai-provider-adapter.interface';
import { ActiveAiProviderConfig } from '@/modules/ai-providers/ai-providers.service';

@Injectable()
export class AiService {
  constructor(
    private readonly aiProvidersService: AiProvidersService,
    private readonly aiAdapterFactory: AiAdapterFactory,
    private readonly aiUsageLogsService: AiUsageLogsService,
  ) {}

  async chat(userMessage: string, feature: AiUsageFeature): Promise<string> {
    const { adapter, config } = await this.resolveActiveAdapter();
    return this.callAndLog(
      () => adapter.chat(userMessage, config),
      config,
      feature,
    );
  }

  async chatWithSystem(
    systemPrompt: string,
    userMessage: string,
    feature: AiUsageFeature,
  ): Promise<string> {
    const { adapter, config } = await this.resolveActiveAdapter();
    return this.callAndLog(
      () => adapter.chatWithSystem(systemPrompt, userMessage, config),
      config,
      feature,
    );
  }

  async multiTurnChat(
    messages: AiChatMessage[],
    feature: AiUsageFeature,
  ): Promise<string> {
    const { adapter, config } = await this.resolveActiveAdapter();
    return this.callAndLog(
      () => adapter.multiTurnChat(messages, config),
      config,
      feature,
    );
  }

  private async callAndLog(
    call: () => ReturnType<AiProviderAdapter['chat']>,
    config: ActiveAiProviderConfig,
    feature: AiUsageFeature,
  ): Promise<string> {
    try {
      const result = await call();
      await this.aiUsageLogsService.record({
        providerId: config.id,
        vendor: config.vendor,
        model: config.model,
        feature,
        usage: result.usage,
        success: true,
      });
      return result.text;
    } catch (error) {
      await this.aiUsageLogsService.record({
        providerId: config.id,
        vendor: config.vendor,
        model: config.model,
        feature,
        usage: { inputTokens: 0, outputTokens: 0 },
        success: false,
      });
      throw error;
    }
  }

  private async resolveActiveAdapter() {
    const config = await this.aiProvidersService.getActiveProviderForRuntime();
    if (!config) {
      throw new InternalServerErrorException(
        'Chưa cấu hình AI Provider đang active, vui lòng liên hệ Admin',
      );
    }

    const adapter = this.aiAdapterFactory.getAdapter(config.vendor);
    return { adapter, config };
  }
}
