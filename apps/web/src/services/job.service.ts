import { authFetchJson, protectedFetchJson } from "@/services/auth.service";
import type {
  CreateJobPostPayload,
  JobPostProfile,
  JobPostStatus,
} from "@/types/job";

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

export async function getJobPosts() {
  return protectedFetchJson<JobPostProfile[]>(
    "/jobs/recruiter/my",
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
