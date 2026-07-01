import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AiProviderVendor {
  ANTHROPIC = 'ANTHROPIC',
  OPENAI = 'OPENAI',
  GEMINI = 'GEMINI',
  GROQ = 'GROQ',
}

export enum AiProviderCheckStatus {
  UNKNOWN = 'UNKNOWN',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export type AdminSummary = {
  id: string;
  name: string;
  email: string;
};

@Entity('ai_providers')
export class AiProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'name' })
  name!: string;

  @Column({ name: 'vendor', type: 'enum', enum: AiProviderVendor })
  vendor!: AiProviderVendor;

  @Column({ name: 'model' })
  model!: string;

  @Column({ name: 'api_key_cipher_text', type: 'text' })
  apiKeyCipherText!: string;

  @Column({ name: 'api_key_iv' })
  apiKeyIv!: string;

  @Column({ name: 'api_key_auth_tag' })
  apiKeyAuthTag!: string;

  @Column({ name: 'api_key_masked' })
  apiKeyMasked!: string;

  @Column({ name: 'max_tokens', default: 1024 })
  maxTokens!: number;

  @Column({ name: 'is_active', default: false })
  isActive!: boolean;

  @Column({ name: 'last_checked_at', type: 'timestamptz', nullable: true })
  lastCheckedAt?: Date | null;

  @Column({
    name: 'last_check_status',
    type: 'enum',
    enum: AiProviderCheckStatus,
    default: AiProviderCheckStatus.UNKNOWN,
  })
  lastCheckStatus!: AiProviderCheckStatus;

  @Column({ name: 'last_check_message', type: 'text', nullable: true })
  lastCheckMessage?: string | null;

  @Column({ name: 'created_by', type: 'jsonb', nullable: true })
  createdBy?: AdminSummary;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
