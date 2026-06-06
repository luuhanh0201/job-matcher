import { JobApplicationStatus } from '@/common/enum/JobApplication.enum';
import { Cv } from '@/modules/cv/entities/cv.entity';
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
  UpdateDateColumn,
} from 'typeorm';

@Entity('job_applications')
@Unique('UQ_job_application_candidate', ['jobId', 'candidateId'])
export class JobApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => JobPostEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: JobPostEntity;

  @Column({ name: 'job_id' })
  jobId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: User;

  @Column({ name: 'candidate_id' })
  candidateId!: string;

  @ManyToOne(() => Cv, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'cv_id' })
  cv?: Cv | null;

  @Column({ name: 'cv_id', nullable: true })
  cvId?: string | null;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter?: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: JobApplicationStatus,
    default: JobApplicationStatus.PENDING,
  })
  status!: JobApplicationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
