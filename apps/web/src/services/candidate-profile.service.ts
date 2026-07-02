import { protectedFetchJson } from "@/services/auth.service";
import type {
  CandidateProfile,
  CandidateProfilePayload,
} from "@/types/candidate-profile";

export async function getMyCandidateProfile() {
  return protectedFetchJson<CandidateProfile>(
    "/candidate-profiles/me",
    {
      method: "GET",
    },
    "Không thể tải hồ sơ ứng viên",
  );
}

export async function updateMyCandidateProfile(
  payload: CandidateProfilePayload,
) {
  return protectedFetchJson<CandidateProfile>(
    "/candidate-profiles/me",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể cập nhật hồ sơ ứng viên",
  );
}

export async function updateMyCandidateAvatar(avatarFile: File) {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  return protectedFetchJson<CandidateProfile>(
    "/candidate-profiles/me/avatar",
    {
      method: "PATCH",
      body: formData,
    },
    "Không thể cập nhật ảnh đại diện",
  );
}

export async function getCandidateProfile(userId: string) {
  return protectedFetchJson<CandidateProfile>(
    `/candidate-profiles/${userId}`,
    {
      method: "GET",
    },
    "Không thể tải hồ sơ ứng viên",
  );
}
