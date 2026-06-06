import { InterviewStatus } from '@/common/enum/Interview.enum';
import { JobApplicationEntity } from '@/modules/job-applications/entities/job-application.entity';
import { User } from '@/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('interviews')
export class InterviewEntity {
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

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: User;

  @Column({ name: 'candidate_id', type: 'uuid' })
  candidateId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'recruiter_id' })
  recruiter!: User;

  @Column({ name: 'recruiter_id', type: 'uuid' })
  recruiterId!: string;

  @Column({ name: 'scheduled_at', type: 'timestamp' })
  scheduledAt!: Date;

  @Column({ name: 'duration_minutes', default: 60 })
  durationMinutes!: number;

  @Column({ name: 'meeting_url', type: 'varchar', nullable: true })
  meetingUrl?: string | null;

  @Column({ name: 'location', type: 'varchar', nullable: true })
  location?: string | null;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.PENDING,
  })
  status!: InterviewStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
