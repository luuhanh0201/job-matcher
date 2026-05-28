import { UploadStatus } from '@/common/enum/StatusUpload.enum';
import { User } from '@/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
export enum FileType {
  PDF = 'pdf',
  DOCX = 'docx',
  TXT = 'txt',
}

@Entity('cv_documents')
export class Cv {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
  @OneToMany(() => Cv, (cv) => cv.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  cvs!: Cv[];
  @Column({ name: 'user_id' })
  userId!: string;
  @Column({ name: 'public_id', unique: true, nullable: false })
  publicId!: string;
  @Column({ name: 'file_name', nullable: false })
  fileName!: string;
  @Column({ name: 'file_type', type: 'enum', enum: FileType })
  fileType!: FileType;
  @Column({ name: 'file_url', nullable: false })
  fileUrl!: string;
  @Column({
    name: 'upload_status',
    type: 'enum',
    enum: UploadStatus,
    default: UploadStatus.PENDING,
  })
  uploadStatus!: UploadStatus;
  @Column({ name: 'processing_error', type: 'text', nullable: true })
  processingError?: string | null;
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
