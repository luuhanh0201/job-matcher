import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
export enum CompanyStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
}
export enum CompanySize {
  SMALL = '1-10',
  MEDIUM = '11-50',
  LARGE = '51-200',
  ENTERPRISE = '200+',
}
export type Location = {
  provinceCode: string;
  provinceName: string;

  wardCode: string;
  wardName: string;

  address?: string;
};
export type UserSummary = {
  id: string;
  name: string;
  email: string;
};
@Entity('companies')
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'name', unique: true })
  name!: string;
  @Column({ name: 'short_name', nullable: true })
  shortName?: string;
  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;
  @Column({ name: 'company_size', default: CompanySize.SMALL })
  companySize!: CompanySize;
  @Column({ name: 'email', nullable: true })
  email?: string;
  @Column({ name: 'phone', nullable: true })
  phone?: string;
  @Column({ name: 'tax_code', nullable: true })
  taxCode?: string;
  @Column({ name: 'company_type', nullable: true })
  companyType?: string;
  @Column({ name: 'website', nullable: true })
  website?: string;
  @Column({ type: 'jsonb', nullable: true })
  location?: Location;
  @Column({ name: 'linkedin_url', nullable: true })
  linkedinUrl?: string;
  @Column({ name: 'facebook_url', nullable: true })
  facebookUrl?: string;
  @Column({ name: 'description', nullable: true, type: 'text' })
  description?: string;
  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean;
  @Column({ name: 'status', default: CompanyStatus.PENDING_APPROVAL })
  status!: CompanyStatus;
  @Column({ name: 'rejection_reason', nullable: true, type: 'text' })
  rejectionReason?: string | null;
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt!: null;
  @Column({ name: 'created_by', type: 'jsonb', nullable: true })
  createdBy?: UserSummary;
  @Column({ name: 'updated_by', type: 'jsonb', nullable: true })
  updatedBy?: UserSummary;
}
