import { LoginResponse } from "@/types/login-response.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginWithGoogle(googleToken: string): Promise<LoginResponse> {
  if (!API_URL) {
    throw new Error("Chưa thêm env");
  }

  const response = await fetch(`${API_URL}/auth/login-google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ googleToken }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg =
      typeof data?.message === "string"
        ? data.message
        : "Đăng nhập bằng Google thất bại";
    throw new Error(msg);
  }

  return data as LoginResponse;
}
