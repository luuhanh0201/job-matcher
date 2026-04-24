import { Cv } from '@/modules/cv/entities/cv.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('parsed_cv')
export class ParsedCv {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @OneToOne(() => Cv)
  @JoinColumn({ name: 'cv_id' })
  cv!: Cv;
  @Column({ name: 'candidate_name', nullable: true })
  candidateName?: string;
  @Column({ name: 'email', nullable: true })
  email?: string;
  @Column({ name: 'phone', nullable: true })
  phone?: string;
  @Column({ name: 'total_experience_years', nullable: true })
  totalExperienceYears?: string;
  @Column({ name: 'current_title', nullable: true })
  currentTitle?: string;
  @Column({ name: 'skills', type: 'text', nullable: true })
  skills?: string;
  @Column({ name: 'education', type: 'text', nullable: true })
  education?: string;
  @Column({ name: 'work_experience', type: 'text', nullable: true })
  workExperience?: string;
  @Column({ name: 'certifications', type: 'text', nullable: true })
  certifications?: string;
  @Column({ name: 'languages', type: 'text', nullable: true })
  languages?: string;
  @CreateDateColumn({ name: 'parsed_at' })
  parsedAt!: Date;
}
