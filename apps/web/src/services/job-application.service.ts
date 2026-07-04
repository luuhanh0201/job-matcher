import { protectedFetchJson } from "@/services/auth.service";
import type {
  CreateJobApplicationPayload,
  JobApplicationProfile,
  JobApplicationStatusLog,
  JobApplicationStatus,
} from "@/types/job-application";
import {
  toQueryString,
  type Paginated,
  type PaginationQuery,
} from "@/types/pagination";

export async function applyToJob(
  jobPostId: string,
  payload: CreateJobApplicationPayload = {},
) {
  return protectedFetchJson<JobApplicationProfile>(
    `/jobs/${jobPostId}/apply`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể ứng tuyển tin tuyển dụng",
  );
}

export type ApplicationsQuery = PaginationQuery & {
  status?: JobApplicationStatus;
  jobId?: string;
};

export async function getJobApplications(
  jobPostId: string,
  query: ApplicationsQuery = {},
) {
  return protectedFetchJson<Paginated<JobApplicationProfile>>(
    `/jobs/${jobPostId}/applications${toQueryString(query)}`,
    {
      method: "GET",
    },
    "Không thể tải danh sách ứng viên",
  );
}

export async function getRecruiterApplications(query: ApplicationsQuery = {}) {
  return protectedFetchJson<Paginated<JobApplicationProfile>>(
    `/jobs/applications/recruiter${toQueryString(query)}`,
    {
      method: "GET",
    },
    "Không thể tải danh sách ứng viên",
  );
}

export async function getMyApplications(query: ApplicationsQuery = {}) {
  return protectedFetchJson<Paginated<JobApplicationProfile>>(
    `/jobs/applications/me${toQueryString(query)}`,
    {
      method: "GET",
    },
    "Không thể tải danh sách việc đã ứng tuyển",
  );
}

export async function updateJobApplicationStatus(
  applicationId: string,
  status: JobApplicationStatus,
) {
  return protectedFetchJson<JobApplicationProfile>(
    `/jobs/applications/${applicationId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
    "Không thể cập nhật trạng thái ứng viên",
  );
}

export async function getJobApplicationStatusLogs(applicationId: string) {
  return protectedFetchJson<JobApplicationStatusLog[]>(
    `/jobs/applications/${applicationId}/status-logs`,
    {
      method: "GET",
    },
    "Không thể tải lịch sử trạng thái hồ sơ",
  );
}
