import { authFetchJson, protectedFetchJson } from "@/services/auth.service";
import type { JobPostProfile } from "@/types/job";

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | "FREELANCE";
export type SeniorityLevel = "NO_EXPERIENCE" | "INTERN" | "JUNIOR" | "MID" | "SENIOR" | "LEAD";
export type JobStatus = "DRAFT" | "OPEN" | "CLOSED" | "BLOCKED";

export type Job = {
  id: string;
  title: string;
  department: string;
  employmentType: EmploymentType;
  seniorityLevel: SeniorityLevel;
  company: string;
  companyLogoUrl?: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string;
  status: JobStatus;
  publishedAt: string;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type JobPayload = Record<string, unknown>;

export type JobSortOption = "newest" | "salary_desc";
export type WorkMode = "ONSITE" | "HYBRID" | "REMOTE";

export type JobsQuery = {
  keyword?: string;
  keywords?: string[];
  provinceCode?: string;
  skills?: string[];
  jobType?: EmploymentType;
  workMode?: WorkMode;
  seniorityLevel?: SeniorityLevel;
  salaryMin?: number;
  sort?: JobSortOption;
  page?: number;
  limit?: number;
};

export type PaginatedJobs = {
  items: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function buildJobsQueryString(query: JobsQuery) {
  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.keywords?.length) params.set("keywords", query.keywords.join(","));
  if (query.provinceCode) params.set("provinceCode", query.provinceCode);
  if (query.skills?.length) params.set("skills", query.skills.join(","));
  if (query.jobType) params.set("jobType", query.jobType);
  if (query.workMode) params.set("workMode", query.workMode);
  if (query.seniorityLevel) params.set("seniorityLevel", query.seniorityLevel);
  if (query.salaryMin !== undefined)
    params.set("salaryMin", String(query.salaryMin));
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getJobs(query: JobsQuery = {}): Promise<PaginatedJobs> {
  const response = await authFetchJson<{
    items: JobPostProfile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(
    `/jobs${buildJobsQueryString(query)}`,
    {
      method: "GET",
    },
    "Không thể tải danh sách việc làm",
  );

  return { ...response, items: response.items.map(toJobCardModel) };
}

export async function getJobById(id: string) {
  const jobPost = await authFetchJson<JobPostProfile>(
    `/jobs/${id}`,
    {
      method: "GET",
    },
    "Không thể tải chi tiết việc làm",
  );

  return toJobCardModel(jobPost);
}

export async function createJob(payload: JobPayload) {
  return protectedFetchJson<Job>(
    "/jobs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể tạo việc làm",
  );
}

export async function updateJob(id: number, payload: JobPayload) {
  return protectedFetchJson<Job>(
    `/jobs/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể cập nhật việc làm",
  );
}

export async function deleteJob(id: number) {
  return protectedFetchJson<{ message?: string }>(
    `/jobs/${id}`,
    {
      method: "DELETE",
    },
    "Không thể xóa việc làm",
  );
}

function formatLocation(jobPost: JobPostProfile) {
  return [
    jobPost.location?.address,
    jobPost.location?.wardName,
    jobPost.location?.provinceName,
  ]
    .filter(Boolean)
    .join(", ");
}

function toJobCardModel(jobPost: JobPostProfile): Job {
  return {
    id: jobPost.id,
    title: jobPost.title,
    department: jobPost.department,
    employmentType: jobPost.jobType,
    seniorityLevel: jobPost.seniorityLevel,
    company: jobPost.company?.name || "Chưa cập nhật công ty",
    companyLogoUrl: jobPost.company?.logoUrl,
    location: formatLocation(jobPost) || "Chưa cập nhật địa điểm",
    salaryMin: jobPost.salaryMin ?? 0,
    salaryMax: jobPost.salaryMax ?? 0,
    description: jobPost.description,
    requirements: jobPost.requirements,
    status: jobPost.status,
    publishedAt: jobPost.publishedAt || "",
    expiredAt: jobPost.expiredAt || "",
    createdAt: jobPost.createdAt,
    updatedAt: jobPost.updatedAt,
  };
}
