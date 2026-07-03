import { JobPostEntity } from '@/modules/jobs/entities/job.entity';
import { User } from '@/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('saved_jobs')
@Unique('UQ_saved_jobs_candidate_job', ['candidateId', 'jobId'])
export class SavedJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: User;

  @Column({ name: 'candidate_id' })
  candidateId!: string;

  @ManyToOne(() => JobPostEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: JobPostEntity;

  @Column({ name: 'job_id' })
  jobId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
