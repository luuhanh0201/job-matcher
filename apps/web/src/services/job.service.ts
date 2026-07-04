import { authFetchJson, protectedFetchJson } from "@/services/auth.service";
import type {
  CreateJobPostPayload,
  JobPostProfile,
  JobPostStatus,
} from "@/types/job";

export type UpdateJobPostPayload = Partial<Omit<CreateJobPostPayload, "companyId" | "status">>;

export async function createJobPost(payload: CreateJobPostPayload) {
  return protectedFetchJson<JobPostProfile>(
    "/jobs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể tạo tin tuyển dụng",
  );
}

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type RecruiterJobsQuery = {
  keyword?: string;
  status?: JobPostStatus;
  page?: number;
  limit?: number;
};

export async function getJobPosts(query: RecruiterJobsQuery = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const queryString = params.toString();
  return protectedFetchJson<Paginated<JobPostProfile>>(
    `/jobs/recruiter/my${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
    "Không thể tải danh sách tin tuyển dụng",
  );
}

export async function getJobPostById(jobPostId: string) {
  return protectedFetchJson<JobPostProfile>(
    `/jobs/recruiter/${jobPostId}`,
    {
      method: "GET",
    },
    "Không thể tải chi tiết tin tuyển dụng",
  );
}

export async function getPublicJobPostById(jobPostId: string) {
  return authFetchJson<JobPostProfile>(
    `/jobs/${jobPostId}`,
    {
      method: "GET",
    },
    "Không thể tải chi tiết tin tuyển dụng",
  );
}

export async function updateJobPostStatus(
  jobPostId: string,
  status: JobPostStatus,
) {
  return protectedFetchJson<JobPostProfile>(
    `/jobs/${jobPostId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
    "Không thể cập nhật trạng thái tin tuyển dụng",
  );
}

export async function updateJobPost(
  jobPostId: string,
  payload: UpdateJobPostPayload,
) {
  return protectedFetchJson<JobPostProfile>(
    `/jobs/${jobPostId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể cập nhật tin tuyển dụng",
  );
}
