import { JobApplicationStatus } from '@/common/enum/JobApplication.enum';
import { UserRole } from '@/common/enum/index.enum';
import { User } from '@/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JobApplicationEntity } from './job-application.entity';

export type ApplicationStatusChangedBy = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

@Entity('job_application_status_logs')
export class JobApplicationStatusLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => JobApplicationEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'application_id' })
  application!: JobApplicationEntity;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId!: string;

  @Column({
    name: 'from_status',
    type: 'enum',
    enum: JobApplicationStatus,
    nullable: true,
  })
  fromStatus?: JobApplicationStatus | null;

  @Column({
    name: 'to_status',
    type: 'enum',
    enum: JobApplicationStatus,
  })
  toStatus!: JobApplicationStatus;

  @Column({ name: 'content', type: 'text' })
  content!: string;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy?: User | null;

  @Column({ name: 'changed_by_id', type: 'uuid', nullable: true })
  changedById?: string | null;

  @Column({ name: 'changed_by_snapshot', type: 'jsonb', nullable: true })
  changedBySnapshot?: ApplicationStatusChangedBy | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
