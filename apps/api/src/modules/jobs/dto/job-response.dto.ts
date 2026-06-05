import {
  CURRENCY,
  JobPostStatus,
  JobType,
  SalaryType,
  SeniorityLevel,
  WorkMode,
} from '@/common/enum/Job.enum';
import {
  LocationResponseDto,
  UserSummaryDto,
} from '@/modules/company/dto/company-response.dto';

export class JobCompanySummaryDto {
  id!: string;
  name!: string;
  shortName?: string;
  logoUrl?: string;
}

export class JobPostResponseDto {
  id!: string;
  title!: string;
  companyId!: string;
  company?: JobCompanySummaryDto | null;
  department!: string;
  jobType!: JobType;
  workMode!: WorkMode;
  seniorityLevel!: SeniorityLevel;
  salaryType!: SalaryType;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency!: CURRENCY;
  description!: string;
  requirements!: string;
  responsibilities?: string | null;
  benefits?: string | null;
  skills?: string[] | null;
  quantity?: number | null;
  location?: LocationResponseDto | null;
  status!: JobPostStatus;
  publishedAt?: Date | null;
  expiredAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
  createdBy?: UserSummaryDto | null;
  updatedBy?: UserSummaryDto | null;
}
