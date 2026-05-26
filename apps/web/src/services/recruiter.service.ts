import { protectedFetchJson } from "@/services/auth.service";

export type RecruiterProfilePayload = {
  contactPhone: string;
  contactEmail?: string;
};

export type RecruiterProfileResponse = {
  id: string;
  fullName?: string;
  email?: string;
  contactPhone: string;
  contactEmail?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function createRecruiterProfile(payload: RecruiterProfilePayload) {
  return protectedFetchJson<RecruiterProfileResponse>(
    "/recruiters/create-profile",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể tạo hồ sơ nhà tuyển dụng",
  );
}