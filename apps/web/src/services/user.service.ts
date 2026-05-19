import { protectedFetchJson } from "@/services/auth.service";
import { AuthProfile } from "@/types/auth-profile.type";

export type UserPayload = Record<string, unknown>;

export async function getCurrentUser() {
  return protectedFetchJson<AuthProfile>(
    "/auth/profile",
    {
      method: "GET",
    },
    "Không thể lấy thông tin người dùng",
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
