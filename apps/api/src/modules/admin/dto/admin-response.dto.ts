import { UserRole, UserStatus } from '@/common/enum/index.enum';
import { CompanyResponseDto } from '@/modules/company/dto/company-response.dto';

export class AdminUserResponseDto {
  id!: string;
  email!: string;
  fullName!: string;
  phone!: string | null;
  avatar!: string | null;
  role!: UserRole;
  status!: UserStatus;
  isVerify!: boolean;
  provider!: string | null;
  lastLoginAt!: Date | null;
  createdAt!: Date;
}

export class PaginatedAdminUsersResponseDto {
  items!: AdminUserResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class PaginatedAdminCompaniesResponseDto {
  items!: CompanyResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class AdminCompanyRecruiterDto {
  id!: string;
  email!: string;
  fullName!: string;
  phone!: string | null;
  avatar!: string | null;
  status!: UserStatus;
  isVerify!: boolean;
  lastLoginAt!: Date | null;
  createdAt!: Date;
  contactPhone!: string | null;
  contactEmail!: string | null;
}

export class AdminCompanyDetailResponseDto extends CompanyResponseDto {
  recruiter!: AdminCompanyRecruiterDto | null;
}

export class AdminStatsResponseDto {
  users!: {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    newLast30Days: number;
  };
  jobs!: {
    total: number;
    byStatus: Record<string, number>;
  };
  applications!: {
    total: number;
    byStatus: Record<string, number>;
  };
  aiUsage!: {
    totalRequests: number;
    totalTokens: number;
    requestsLast30Days: number;
  };
}
