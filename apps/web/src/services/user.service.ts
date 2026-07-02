import { protectedFetchJson } from "@/services/auth.service";
import { AuthProfile } from "@/types/auth-profile.type";
import { RecruiterProfile } from "@/types/recruiter-profile";

export type UserPayload = Record<string, unknown>;

export type UpdateRecruiterProfilePayload = {
  fullName: string;
  contactEmail: string;
  contactPhone: string;
};

export async function getCurrentUser() {
  return protectedFetchJson<AuthProfile>(
    "/auth/profile",
    {
      method: "GET",
    },
    "Không thể lấy thông tin người dùng",
  );
}
export async function getProfileRecruiter(){
  return await protectedFetchJson<RecruiterProfile>(
    "/recruiters/profile",
    {
      method: "GET",
    },
    "Không thể lấy thông tin nhà tuyển dụng",
  );
}

export async function updateRecruiterAvatar(avatarFile: File) {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  return protectedFetchJson<RecruiterProfile>(
    "/recruiters/profile/avatar",
    {
      method: "PATCH",
      body: formData,
    },
    "Không thể cập nhật ảnh đại diện",
  );
}

export async function updateProfileRecruiter(payload: UpdateRecruiterProfilePayload) {
  return protectedFetchJson<RecruiterProfile>(
    "/recruiters/profile",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể cập nhật thông tin nhà tuyển dụng",
  );
}

export async function createUser(payload: UserPayload) {
  return protectedFetchJson<AuthProfile>(
    "/user",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Không thể tạo người dùng",
  );
}
