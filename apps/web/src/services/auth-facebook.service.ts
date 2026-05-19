import { LoginResponse } from "@/types/login-response.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginWithFacebook(facebookToken: string): Promise<LoginResponse> {
  if (!API_URL) {
    throw new Error("Chưa thêm env");
  }

  const response = await fetch(`${API_URL}/auth/login-facebook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ facebookToken }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg =
      typeof data?.message === "string"
        ? data.message
        : "Đăng nhập bằng Facebook thất bại";
    throw new Error(msg);
  }

  return data as LoginResponse;
}
