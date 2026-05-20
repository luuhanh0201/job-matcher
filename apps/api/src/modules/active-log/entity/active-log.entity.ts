import { UserRole } from '@/common/enum/index.enum';
import { User } from '@/modules/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum LogStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity('active_log')
export class ActiveLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    name: 'actor_type',
  })
  actorType!: UserRole;

  @Column({ type: 'uuid', name: 'actor_id' })
  actorId!: string;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'actor_id' })
  actor!: User;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({
    type: 'enum',
    enum: LogStatus,
    default: LogStatus.SUCCESS,
  })
  status!: LogStatus;

  @Column({ type: 'varchar', length: 50, name: 'entity_type', nullable: true })
  entityType!: string | null;

  @Column({ type: 'uuid', name: 'entity_id', nullable: true })
  entityId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
