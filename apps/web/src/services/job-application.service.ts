import { protectedFetchJson } from "@/services/auth.service";
import type {
  CreateJobApplicationPayload,
  JobApplicationProfile,
} from "@/types/job-application";

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

export async function getJobApplications(jobPostId: string) {
  return protectedFetchJson<JobApplicationProfile[]>(
    `/jobs/${jobPostId}/applications`,
    {
      method: "GET",
    },
    "Không thể tải danh sách ứng viên",
  );
}

export async function getRecruiterApplications() {
  return protectedFetchJson<JobApplicationProfile[]>(
    "/jobs/applications/recruiter",
    {
      method: "GET",
    },
    "Không thể tải danh sách ứng viên",
  );
}
