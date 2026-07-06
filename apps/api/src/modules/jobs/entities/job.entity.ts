import {
  CURRENCY,
  JobPostStatus,
  JobType,
  SalaryType,
  SeniorityLevel,
  WorkMode,
} from '@/common/enum/Job.enum';
import { CompanyEntity } from '@/modules/company/entity/company.entity';
import type {
  Location,
  UserSummary,
} from '@/modules/company/entity/company.entity';
import { User } from '@/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('job_posts')
export class JobPostEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @Column({ nullable: false })
  title!: string;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company!: CompanyEntity;

  @Column({ name: 'company_id' })
  companyId!: string;

  @Column({ name: 'department', nullable: false })
  department!: string;

  @Column({ name: 'job_type', type: 'enum', enum: JobType })
  jobType!: JobType;

  @Column({
    name: 'work_mode',
    type: 'enum',
    enum: WorkMode,
    default: WorkMode.ONSITE,
  })
  workMode!: WorkMode;

  @Column({
    name: 'seniority_level',
    type: 'enum',
    enum: SeniorityLevel,
    default: SeniorityLevel.NO_EXPERIENCE,
  })
  seniorityLevel!: SeniorityLevel;

  @Column({
    name: 'salary_type',
    type: 'enum',
    enum: SalaryType,
    default: SalaryType.NEGOTIABLE,
  })
  salaryType!: SalaryType;

  @Column({ name: 'salary_min', nullable: true })
  salaryMin?: number;

  @Column({ name: 'salary_max', nullable: true })
  salaryMax?: number;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'requirements', type: 'text' })
  requirements!: string;

  @Column({ name: 'responsibilities', type: 'text', nullable: true })
  responsibilities?: string;

  @Column({ name: 'benefits', type: 'text', nullable: true })
  benefits?: string;

  @Column({ name: 'skills', type: 'jsonb', nullable: true })
  skills?: string[];

  @Column({ name: 'quantity', nullable: true })
  quantity?: number;

  @Column({ name: 'location', type: 'jsonb', nullable: true })
  location?: Location;

  @Column({
    name: 'status',
    type: 'enum',
    enum: JobPostStatus,
    default: JobPostStatus.DRAFT,
  })
  status!: JobPostStatus;

  @Column({
    name: 'currency',
    type: 'enum',
    enum: CURRENCY,
    default: CURRENCY.VND,
  })
  currency!: CURRENCY;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ name: 'expired_at', type: 'timestamp', nullable: true })
  expiredAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Column({ name: 'updated_by', type: 'jsonb', nullable: true })
  updatedBy?: UserSummary;

  @Column({
    name: 'embedding',
    type: 'vector',
    length: '768',
    nullable: true,
    select: false,
  })
  embedding?: number[] | null;
}
