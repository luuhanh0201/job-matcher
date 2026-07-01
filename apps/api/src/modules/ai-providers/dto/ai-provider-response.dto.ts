import {
  AdminSummary,
  AiProviderCheckStatus,
  AiProviderVendor,
} from '../entities/ai-provider.entity';

export class AiProviderResponseDto {
  id!: string;
  name!: string;
  vendor!: AiProviderVendor;
  model!: string;
  maskedApiKey!: string;
  maxTokens!: number;
  isActive!: boolean;
  lastCheckedAt?: Date | null;
  lastCheckStatus!: AiProviderCheckStatus;
  lastCheckMessage?: string | null;
  createdBy?: AdminSummary;
  createdAt!: Date;
  updatedAt!: Date;
}
