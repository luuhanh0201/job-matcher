import type { JobPostStatus } from "@/types/job";

export type JobApplicationStatus =
  | "PENDING"
  | "VIEWED"
  | "SHORTLISTED"
  | "REJECTED"
  | "INTERVIEW"
  | "HIRED";

export type CreateJobApplicationPayload = {
  cvId?: string;
  coverLetter?: string;
};

export type JobApplicationProfile = {
  id: string;
  jobId: string;
  job: {
    id: string;
    title: string;
    status: JobPostStatus;
    company?: {
      id: string;
      name: string;
      logoUrl?: string;
    } | null;
  };
  candidate: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  cv?: {
    id: string;
    publicId: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
  } | null;
  coverLetter?: string | null;
  status: JobApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type JobApplicationStatusLog = {
  id: string;
  applicationId: string;
  fromStatus: JobApplicationStatus | null;
  toStatus: JobApplicationStatus;
  content: string;
  changedBy: {
    id: string;
    fullName: string;
    email: string;
    role: "CANDIDATE" | "RECRUITER" | "ADMIN";
  } | null;
  createdAt: string;
};

export const JOB_APPLICATION_STATUS_LABEL: Record<
  JobApplicationStatus,
  string
> = {
  PENDING: "Chờ xem xét",
  VIEWED: "Đã xem",
  SHORTLISTED: "Phù hợp",
  REJECTED: "Từ chối",
  INTERVIEW: "Phỏng vấn",
  HIRED: "Đã tuyển",
};
