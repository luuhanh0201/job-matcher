import { protectedFetchJson } from "@/services/auth.service";
import type { JobPostProfile } from "@/types/job";

export type SavedJobResponse = {
  jobId: string;
  saved: boolean;
  savedAt: string | null;
};

export async function saveJob(jobId: string) {
  return protectedFetchJson<SavedJobResponse>(
    `/saved-jobs/${jobId}`,
    {
      method: "POST",
    },
    "Không thể lưu tin tuyển dụng",
  );
}

export async function unsaveJob(jobId: string) {
  return protectedFetchJson<SavedJobResponse>(
    `/saved-jobs/${jobId}`,
    {
      method: "DELETE",
    },
    "Không thể bỏ lưu tin tuyển dụng",
  );
}

export async function getMySavedJobs() {
  return protectedFetchJson<JobPostProfile[]>(
    "/saved-jobs/my",
    {
      method: "GET",
    },
    "Không thể tải danh sách việc đã lưu",
  );
}

export async function getMySavedJobIds() {
  return protectedFetchJson<string[]>(
    "/saved-jobs/my/ids",
    {
      method: "GET",
    },
    "Không thể tải danh sách việc đã lưu",
  );
}
