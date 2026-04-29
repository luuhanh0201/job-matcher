import { User } from '@/modules/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ unique: true, name: 'session_token' })
  sessionToken!: string; // Token duy nhất để xác định phiên làm việc, có thể dùng UUID hoặc token ngẫu nhiên

  @Column({ nullable: true, name: 'refresh_token' })
  refreshToken?: string; // Token dùng để làm mới access token khi hết hạn

  @Column({ nullable: true, name: 'ip_address' })
  ipAddress?: string; // Lưu IP của người dùng khi đăng nhập

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent?: string; // Lưu thông tin trình duyệt và thiết bị của người dùng

  @Column({ nullable: true, name: 'device_name' })
  deviceName?: string; // Lưu tên thiết bị nếu có thể xác định được

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean; // Trạng thái phiên làm việc, có thể dùng để đánh dấu phiên đã bị thu hồi

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date; // Thời điểm tạo phiên làm việc

  @UpdateDateColumn({ name: 'last_activity_at' })
  lastActivityAt!: Date; // Thời điểm hoạt động cuối cùng của phiên làm việc

  @Column({ name: 'expires_at' })
  expiresAt!: Date; // Thời điểm hết hạn của phiên làm việc

  @Column({ nullable: true, name: 'revoked_at' })
  revokedAt?: Date; // Thời điểm phiên làm việc bị thu hồi

  @Column({ nullable: true, name: 'revoke_reason' })
  revokeReason?: string; // Lý do thu hồi phiên làm việc, nếu có
}
