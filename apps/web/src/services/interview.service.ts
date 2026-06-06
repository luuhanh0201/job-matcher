import { protectedFetchJson } from "@/services/auth.service";
import type {
  CreateInterviewPayload,
  InterviewProfile,
  InterviewStatus,
  UpdateInterviewPayload,
} from "@/types/interview";

export async function createInterview(
  applicationId: string,
  payload: CreateInterviewPayload,
) {
  return protectedFetchJson<InterviewProfile>(
    `/interviews/applications/${applicationId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể tạo lịch phỏng vấn",
  );
}

export async function getRecruiterInterviews() {
  return protectedFetchJson<InterviewProfile[]>(
    "/interviews/recruiter",
    {
      method: "GET",
    },
    "Không thể tải lịch phỏng vấn",
  );
}

export async function getMyInterviews() {
  return protectedFetchJson<InterviewProfile[]>(
    "/interviews/me",
    {
      method: "GET",
    },
    "Không thể tải lịch phỏng vấn",
  );
}

export async function respondInterview(
  interviewId: string,
  status: Extract<InterviewStatus, "ACCEPTED" | "DECLINED">,
) {
  return protectedFetchJson<InterviewProfile>(
    `/interviews/${interviewId}/respond`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
    "Không thể phản hồi lịch phỏng vấn",
  );
}

export async function updateInterview(
  interviewId: string,
  payload: UpdateInterviewPayload,
) {
  return protectedFetchJson<InterviewProfile>(
    `/interviews/${interviewId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể cập nhật lịch phỏng vấn",
  );
}

export async function cancelInterview(interviewId: string) {
  return protectedFetchJson<InterviewProfile>(
    `/interviews/${interviewId}/cancel`,
    {
      method: "PATCH",
    },
    "Không thể hủy lịch phỏng vấn",
  );
}
