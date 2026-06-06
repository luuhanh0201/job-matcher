import type { CompanyLocation, UserSummary } from "@/types/company";

export type JobPostStatus = "DRAFT" | "OPEN" | "CLOSED";
export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERN"
  | "FREELANCE";
export type WorkMode = "ONSITE" | "HYBRID" | "REMOTE";
export type SalaryType = "NEGOTIABLE" | "RANGE" | "FIXED";
export type SeniorityLevel =
  | "NO_EXPERIENCE"
  | "INTERN"
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "LEAD";
export type Currency = "VND" | "USD" | "EUR" | "GBP";

export type CreateJobPostPayload = {
  title: string;
  companyId: string;
  department: string;
  jobType: JobType;
  workMode?: WorkMode;
  seniorityLevel?: SeniorityLevel;
  salaryType: SalaryType;
  salaryMin?: number;
  salaryMax?: number;
  currency?: Currency;
  description: string;
  requirements: string;
  responsibilities?: string;
  benefits?: string;
  skills?: string[];
  quantity?: number;
  status?: JobPostStatus;
  expiredAt: string;
};

export type JobCompanySummary = {
  id: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
};

export type JobPostProfile = {
  id: string;
  title: string;
  companyId: string;
  company?: JobCompanySummary | null;
  department: string;
  jobType: JobType;
  workMode: WorkMode;
  seniorityLevel: SeniorityLevel;
  salaryType: SalaryType;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: Currency;
  description: string;
  requirements: string;
  responsibilities?: string | null;
  benefits?: string | null;
  skills?: string[] | null;
  quantity?: number | null;
  location?: CompanyLocation | null;
  status: JobPostStatus;
  publishedAt?: string | null;
  expiredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: UserSummary | null;
  updatedBy?: UserSummary | null;
};

export const SENIORITY_LEVEL_LABEL: Record<SeniorityLevel, string> = {
  NO_EXPERIENCE: "Không yêu cầu",
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID: "Middle",
  SENIOR: "Senior",
  LEAD: "Lead",
};
