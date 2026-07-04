import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  decryptSecret,
  encryptSecret,
  maskSecret,
} from '@/common/helpers/crypto.helper';
import { User } from '@/modules/user/entities/user.entity';
import { AiAdapterFactory } from '@/modules/ai/adapters/ai-adapter.factory';
import { AiUsageLogsService } from '@/modules/ai-usage/ai-usage-logs.service';
import { AiUsageFeature } from '@/modules/ai-usage/entities/ai-usage-log.entity';
import { CreateAiProviderDto } from './dto/create-ai-provider.dto';
import { UpdateAiProviderDto } from './dto/update-ai-provider.dto';
import { AiProviderResponseDto } from './dto/ai-provider-response.dto';
import {
  AiProviderCheckStatus,
  AiProviderEntity,
  AiProviderVendor,
} from './entities/ai-provider.entity';

const TEST_CONNECTION_MAX_TOKENS = 10;
const TEST_CONNECTION_PROMPT = 'ping';

export interface ActiveAiProviderConfig {
  id: string;
  vendor: AiProviderVendor;
  model: string;
  apiKey: string;
  maxTokens: number;
}

@Injectable()
export class AiProvidersService implements OnModuleInit {
  private readonly logger = new Logger(AiProvidersService.name);

  constructor(
    @InjectRepository(AiProviderEntity)
    private readonly aiProviderRepository: Repository<AiProviderEntity>,
    private readonly dataSource: DataSource,
    private readonly aiAdapterFactory: AiAdapterFactory,
    private readonly aiUsageLogsService: AiUsageLogsService,
  ) {}

  async onModuleInit() {
    const count = await this.aiProviderRepository.count();
    if (count > 0) {
      return;
    }

    const envApiKey = process.env.ANTHROPIC_API_KEY;
    if (!envApiKey) {
      this.logger.warn(
        'Chưa có AI Provider nào trong DB và không có ANTHROPIC_API_KEY để tự seed. Cần Admin thêm AI Provider trước khi các tính năng AI hoạt động.',
      );
      return;
    }

    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5';
    const maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS ?? '10240', 10);

    const encrypted = encryptSecret(envApiKey);
    const provider = this.aiProviderRepository.create({
      name: 'Mặc định từ .env',
      vendor: AiProviderVendor.ANTHROPIC,
      model,
      apiKeyCipherText: encrypted.cipherText,
      apiKeyIv: encrypted.iv,
      apiKeyAuthTag: encrypted.authTag,
      apiKeyMasked: maskSecret(envApiKey),
      maxTokens: Number.isFinite(maxTokens) ? maxTokens : 1024,
      isActive: true,
    });
    await this.aiProviderRepository.save(provider);
    this.logger.log(
      'Đã tự seed 1 AI Provider mặc định từ biến môi trường ANTHROPIC_API_KEY.',
    );
  }

  async create(
    dto: CreateAiProviderDto,
    admin: User,
  ): Promise<AiProviderResponseDto> {
    const encrypted = encryptSecret(dto.apiKey);

    const provider = this.aiProviderRepository.create({
      name: dto.name,
      vendor: dto.vendor,
      model: dto.model,
      apiKeyCipherText: encrypted.cipherText,
      apiKeyIv: encrypted.iv,
      apiKeyAuthTag: encrypted.authTag,
      apiKeyMasked: maskSecret(dto.apiKey),
      maxTokens: dto.maxTokens ?? 1024,
      isActive: false,
      createdBy: { id: admin.id, name: admin.fullName, email: admin.email },
    });

    const saved = await this.aiProviderRepository.save(provider);

    // Tự động kiểm tra kết nối ngay sau khi thêm, không chặn việc lưu nếu thất bại
    // (admin có thể sửa lại key sau, không muốn mất dữ liệu vừa nhập).
    await this.testConnection(saved.id);
    const refreshed = await this.findOrFail(saved.id);
    return this.toResponse(refreshed);
  }

  async findAll(): Promise<AiProviderResponseDto[]> {
    const providers = await this.aiProviderRepository.find({
      order: { createdAt: 'DESC' },
    });
    return providers.map((provider) => this.toResponse(provider));
  }

  async findOne(id: string): Promise<AiProviderResponseDto> {
    const provider = await this.findOrFail(id);
    return this.toResponse(provider);
  }

  async update(
    id: string,
    dto: UpdateAiProviderDto,
  ): Promise<AiProviderResponseDto> {
    const provider = await this.findOrFail(id);

    if (dto.name !== undefined) provider.name = dto.name;
    if (dto.vendor !== undefined) provider.vendor = dto.vendor;
    if (dto.model !== undefined) provider.model = dto.model;
    if (dto.maxTokens !== undefined) provider.maxTokens = dto.maxTokens;

    if (dto.apiKey) {
      const encrypted = encryptSecret(dto.apiKey);
      provider.apiKeyCipherText = encrypted.cipherText;
      provider.apiKeyIv = encrypted.iv;
      provider.apiKeyAuthTag = encrypted.authTag;
      provider.apiKeyMasked = maskSecret(dto.apiKey);
    }

    const saved = await this.aiProviderRepository.save(provider);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<{ message: string }> {
    const provider = await this.findOrFail(id);
    if (provider.isActive) {
      throw new BadRequestException(
        'Không thể xoá AI Provider đang được kích hoạt. Vui lòng kích hoạt provider khác trước.',
      );
    }

    await this.aiProviderRepository.remove(provider);
    return { message: 'Xoá AI Provider thành công' };
  }

  async activate(id: string): Promise<AiProviderResponseDto> {
    await this.findOrFail(id);

    const testResult = await this.testConnection(id);
    if (!testResult.success) {
      throw new BadRequestException(
        `Không thể kích hoạt: ${testResult.message}`,
      );
    }

    const activated = await this.dataSource.transaction(async (manager) => {
      await manager.update(
        AiProviderEntity,
        { isActive: true },
        { isActive: false },
      );
      await manager.update(AiProviderEntity, { id }, { isActive: true });
      const updated = await manager.findOneBy(AiProviderEntity, { id });
      if (!updated) {
        throw new NotFoundException('AI Provider không tồn tại');
      }
      return updated;
    });

    return this.toResponse(activated);
  }

  async testConnection(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const provider = await this.findOrFail(id);
    const apiKey = decryptSecret(
      provider.apiKeyCipherText,
      provider.apiKeyIv,
      provider.apiKeyAuthTag,
    );
    const adapter = this.aiAdapterFactory.getAdapter(provider.vendor);

    try {
      const result = await adapter.chat(TEST_CONNECTION_PROMPT, {
        apiKey,
        model: provider.model,
        maxTokens: TEST_CONNECTION_MAX_TOKENS,
      });

      provider.lastCheckedAt = new Date();
      provider.lastCheckStatus = AiProviderCheckStatus.SUCCESS;
      provider.lastCheckMessage = null;
      await this.aiProviderRepository.save(provider);

      await this.aiUsageLogsService.record({
        providerId: provider.id,
        vendor: provider.vendor,
        model: provider.model,
        feature: AiUsageFeature.CONNECTION_TEST,
        usage: result.usage,
        success: true,
      });

      return { success: true, message: 'Kết nối thành công' };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể kết nối tới nhà cung cấp AI';

      provider.lastCheckedAt = new Date();
      provider.lastCheckStatus = AiProviderCheckStatus.FAILED;
      provider.lastCheckMessage = message.slice(0, 500);
      await this.aiProviderRepository.save(provider);

      await this.aiUsageLogsService.record({
        providerId: provider.id,
        vendor: provider.vendor,
        model: provider.model,
        feature: AiUsageFeature.CONNECTION_TEST,
        usage: { inputTokens: 0, outputTokens: 0 },
        success: false,
      });

      return { success: false, message };
    }
  }

  async getActiveProviderForRuntime(): Promise<ActiveAiProviderConfig | null> {
    const provider = await this.aiProviderRepository.findOneBy({
      isActive: true,
    });
    if (!provider) {
      return null;
    }

    const apiKey = decryptSecret(
      provider.apiKeyCipherText,
      provider.apiKeyIv,
      provider.apiKeyAuthTag,
    );

    return {
      id: provider.id,
      vendor: provider.vendor,
      model: provider.model,
      apiKey,
      maxTokens: provider.maxTokens,
    };
  }

  private async findOrFail(id: string): Promise<AiProviderEntity> {
    const provider = await this.aiProviderRepository.findOneBy({ id });
    if (!provider) {
      throw new NotFoundException('AI Provider không tồn tại');
    }
    return provider;
  }

  private toResponse(provider: AiProviderEntity): AiProviderResponseDto {
    return {
      id: provider.id,
      name: provider.name,
      vendor: provider.vendor,
      model: provider.model,
      maskedApiKey: provider.apiKeyMasked,
      maxTokens: provider.maxTokens,
      isActive: provider.isActive,
      lastCheckedAt: provider.lastCheckedAt,
      lastCheckStatus: provider.lastCheckStatus,
      lastCheckMessage: provider.lastCheckMessage,
      createdBy: provider.createdBy,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }
}
