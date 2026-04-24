import { EmploymentType, JobStatus, SeniorityLevel } from '@/enum/index.enum';
import { User } from '@/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;
  @Column({ nullable: false })
  title!: string;

  @Column({ name: 'department', nullable: false })
  department!: string;

  @Column({ name: 'employment_type', type: 'enum', enum: EmploymentType })
  employmentType!: EmploymentType;

  @Column({ name: 'seniority_level', type: 'enum', enum: SeniorityLevel })
  seniorityLevel!: SeniorityLevel;

  @Column()
  company!: string;

  @Column()
  location!: string;

  @Column({ name: 'salary_min' })
  salaryMin!: number;

  @Column({ name: 'salary_max' })
  salaryMax!: number;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'requirements', type: 'text' })
  requirements!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status!: JobStatus;

  @CreateDateColumn({ name: 'published_at' })
  publishedAt!: Date;

  @CreateDateColumn({ name: 'expired_at' })
  expiredAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
