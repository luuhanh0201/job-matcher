import { Job } from '@/modules/jobs/entities/job.entity';
import { ParsedCv } from '@/modules/parsed-cv/entities/parsed-cv.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('match_results')
export class MatchResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job!: Job;
  @ManyToOne(() => ParsedCv)
  @JoinColumn({ name: 'parsed_cv_id' })
  parsedCv!: ParsedCv;
  @Column({ name: 'overall_score', type: 'float' })
  overallScore!: number;
  @Column({ name: 'skill_score', type: 'float' })
  skillScore!: number;
  @Column({ name: 'experience_score', type: 'float' })
  experienceScore!: number;
  @Column({ name: 'education_score', type: 'float' })
  educationScore!: number;
  @Column({ name: 'title_score', type: 'float' })
  titleScore!: number;
  @Column({ name: 'matched_skills', type: 'text' })
  matchedSkills!: string;
  @Column({ name: 'missing_skills', type: 'text' })
  missingSkills!: string;
  @Column({ name: 'explanation', type: 'text' })
  explanation!: string;
  @CreateDateColumn({ name: 'matched_at' })
  matchedAt!: Date;
}
