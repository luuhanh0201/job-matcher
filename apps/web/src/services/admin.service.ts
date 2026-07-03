import { protectedFetchJson } from "@/services/auth.service";
import type { JobPostProfile, JobPostStatus } from "@/types/job";
import type { UserRole } from "@/types/user-role.type";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  isVerify: boolean;
  provider: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminStats = {
  users: {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    newLast30Days: number;
  };
  jobs: {
    total: number;
    byStatus: Record<string, number>;
  };
  applications: {
    total: number;
    byStatus: Record<string, number>;
  };
  aiUsage: {
    totalRequests: number;
    totalTokens: number;
    requestsLast30Days: number;
  };
};

export type AdminUsersQuery = {
  keyword?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
};

export type AdminJobsQuery = {
  keyword?: string;
  status?: JobPostStatus | "BLOCKED";
  page?: number;
  limit?: number;
};

function toQueryString(query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getAdminUsers(query: AdminUsersQuery = {}) {
  return protectedFetchJson<Paginated<AdminUser>>(
    `/admin/users${toQueryString(query)}`,
    { method: "GET" },
    "Không thể tải danh sách người dùng",
  );
}

export async function updateAdminUserStatus(userId: string, status: UserStatus) {
  return protectedFetchJson<AdminUser>(
    `/admin/users/${userId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
    "Không thể cập nhật trạng thái người dùng",
  );
}

export async function getAdminJobs(query: AdminJobsQuery = {}) {
  return protectedFetchJson<Paginated<JobPostProfile>>(
    `/admin/jobs${toQueryString(query)}`,
    { method: "GET" },
    "Không thể tải danh sách tin tuyển dụng",
  );
}

export async function updateAdminJobStatus(
  jobId: string,
  status: "OPEN" | "CLOSED" | "BLOCKED",
) {
  return protectedFetchJson<JobPostProfile>(
    `/admin/jobs/${jobId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
    "Không thể cập nhật trạng thái tin tuyển dụng",
  );
}

export async function getAdminStats() {
  return protectedFetchJson<AdminStats>(
    "/admin/stats",
    { method: "GET" },
    "Không thể tải thống kê hệ thống",
  );
}
