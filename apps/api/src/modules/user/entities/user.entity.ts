import { UserRole, UserStatus } from '@/enum/index.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false, unique: true })
  email!: string;

  @Column({ name: 'password_hash', nullable: false })
  passwordHash!: string;

  @Column({ name: 'full_name', nullable: false })
  fullName!: string;

  @Column({ name: 'phone' })
  phone!: string;

  @Column({ name: 'avatar', nullable: true })
  avatar!: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.CANDIDATE,
  })
  role!: UserRole;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({
    name: 'last_login_at',
    type: 'timestamp',
    nullable: true,
  })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
