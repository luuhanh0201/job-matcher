import { User } from '@/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('recruiters')
export class RecruiterEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @OneToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
  @Column({ name: 'user_id' })
  userId!: string;
  @Column({ name: 'contact_phone', nullable: true })
  contactPhone?: string;
  @Column({ name: 'contact_email', nullable: true })
  contactEmail?: string;
  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean;
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt!: Date;
}
