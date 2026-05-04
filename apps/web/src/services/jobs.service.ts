import { authFetchJson, protectedFetchJson } from "@/services/auth.service";

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | "FREELANCE";
export type SeniorityLevel = "INTERN" | "JUNIOR" | "MID" | "SENIOR" | "LEAD";
export type JobStatus = "DRAFT" | "OPEN" | "CLOSED";

export type Job = {
  id: string;
  title: string;
  department: string;
  employmentType: EmploymentType;
  seniorityLevel: SeniorityLevel;
  company: string;
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

export async function getJobs() {
  return authFetchJson<Job[]>(
    "/jobs",
    {
      method: "GET",
    },
    "Không thể tải danh sách việc làm",
  );
}

export async function getJobById(id: number) {
  return authFetchJson<Job>(
    `/jobs/${id}`,
    {
      method: "GET",
    },
    "Không thể tải chi tiết việc làm",
  );
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
