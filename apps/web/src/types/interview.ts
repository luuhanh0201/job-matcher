import type { JobApplicationStatus } from "@/types/job-application";

export type InterviewStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";

export type CreateInterviewPayload = {
  scheduledAt: string;
  durationMinutes?: number;
  meetingUrl?: string;
  location?: string;
  note?: string;
};

export type UpdateInterviewPayload = Partial<CreateInterviewPayload>;

export type InterviewProfile = {
  id: string;
  applicationId: string;
  applicationStatus: JobApplicationStatus;
  candidate: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  recruiter: {
    id: string;
    fullName: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
    company?: {
      id: string;
      name: string;
      logoUrl?: string;
    } | null;
  };
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl?: string | null;
  location?: string | null;
  note?: string | null;
  status: InterviewStatus;
  createdAt: string;
  updatedAt: string;
};

export const INTERVIEW_STATUS_LABEL: Record<InterviewStatus, string> = {
  PENDING: "Chờ xác nhận",
  ACCEPTED: "Đã xác nhận",
  DECLINED: "Đã từ chối",
  CANCELLED: "Đã hủy",
};
