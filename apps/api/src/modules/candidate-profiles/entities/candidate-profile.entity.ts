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

@Entity('candidate_profiles')
export class CandidateProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', unique: true, type: 'uuid' })
  userId!: string;

  @Column({ name: 'current_title', type: 'varchar', nullable: true })
  currentTitle?: string | null;

  @Column({ name: 'total_experience_years', type: 'varchar', nullable: true })
  totalExperienceYears?: string | null;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary?: string | null;

  @Column({ name: 'skills', type: 'jsonb', nullable: true })
  skills?: string[] | null;

  @Column({ name: 'education', type: 'jsonb', nullable: true })
  education?: string[] | null;

  @Column({ name: 'work_experience', type: 'jsonb', nullable: true })
  workExperience?: string[] | null;

  @Column({ name: 'certifications', type: 'jsonb', nullable: true })
  certifications?: string[] | null;

  @Column({ name: 'languages', type: 'jsonb', nullable: true })
  languages?: string[] | null;

  @Column({ name: 'portfolio_url', type: 'varchar', nullable: true })
  portfolioUrl?: string | null;

  @Column({ name: 'linkedin_url', type: 'varchar', nullable: true })
  linkedinUrl?: string | null;

  @Column({ name: 'github_url', type: 'varchar', nullable: true })
  githubUrl?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
