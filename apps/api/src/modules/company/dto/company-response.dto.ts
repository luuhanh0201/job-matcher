import { CompanySize, CompanyStatus } from '../entity/company.entity';

export class LocationResponseDto {
  provinceCode!: string;
  provinceName!: string;
  wardCode!: string;
  wardName!: string;
  address?: string;
}
export class UserSummaryDto {
  id!: string;
  name!: string;
  email!: string;
}
export class CompanyResponseDto {
  id!: string;
  name!: string;
  shortName?: string;
  logoUrl?: string;
  companySize!: CompanySize;
  email?: string;
  phone?: string;
  taxCode?: string;
  companyType?: string;
  website?: string;
  location?: LocationResponseDto | null;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  description?: string | null;
  isVerified!: boolean;
  status!: CompanyStatus;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;
  createdBy?: UserSummaryDto | null;
}
