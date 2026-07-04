import { protectedFetchJson } from "@/services/auth.service";
import type { JobPostProfile } from "@/types/job";
import {
  toQueryString,
  type Paginated,
  type PaginationQuery,
} from "@/types/pagination";

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

export async function getMySavedJobs(query: PaginationQuery = {}) {
  return protectedFetchJson<Paginated<JobPostProfile>>(
    `/saved-jobs/my${toQueryString(query)}`,
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
