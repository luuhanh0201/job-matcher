import { authFetchJson, protectedFetchJson } from "@/services/auth.service";

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: number;
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
