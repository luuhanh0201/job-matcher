import {
  AiProviderEntity,
  AiProviderVendor,
} from '@/modules/ai-providers/entities/ai-provider.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AiUsageFeature {
  CHAT = 'CHAT',
  JOB_MATCHING = 'JOB_MATCHING',
  CV_EXTRACTION = 'CV_EXTRACTION',
  CV_ANALYSIS = 'CV_ANALYSIS',
  CONNECTION_TEST = 'CONNECTION_TEST',
}

@Entity('ai_usage_logs')
export class AiUsageLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => AiProviderEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider?: AiProviderEntity | null;

  @Column({ name: 'provider_id', nullable: true })
  providerId?: string | null;

  @Column({ name: 'vendor', type: 'enum', enum: AiProviderVendor })
  vendor!: AiProviderVendor;

  @Column({ name: 'model' })
  model!: string;

  @Column({ name: 'feature', type: 'enum', enum: AiUsageFeature })
  feature!: AiUsageFeature;

  @Column({ name: 'input_tokens', default: 0 })
  inputTokens!: number;

  @Column({ name: 'output_tokens', default: 0 })
  outputTokens!: number;

  @Column({ name: 'total_tokens', default: 0 })
  totalTokens!: number;

  @Column({ name: 'success', default: true })
  success!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
