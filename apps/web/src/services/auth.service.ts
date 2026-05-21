import { LoginPayload } from "@/types/login-payload.type";
import { LoginResponse } from "@/types/login-response.type";
import { RegisterPayload } from "@/types/register-payload.type";
import { AuthProfile } from "../types/auth-profile.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

let refreshRequest: Promise<LoginResponse | null> | null = null;

type AuthRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  withAuth?: boolean;
};

type ProtectedAuthRequestOptions = Omit<AuthRequestOptions, "withAuth">;

export class SessionExpiredError extends Error {
  constructor(message = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

function emitSessionExpired() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}

function getErrorMessage(errorData: unknown, fallback = "Đã có lỗi xảy ra") {
  if (typeof errorData !== "object" || errorData === null) {
    return fallback;
  }

  const maybeMessage = (errorData as { message?: unknown }).message;

  if (Array.isArray(maybeMessage) && maybeMessage.length > 0 && typeof maybeMessage[0] === "string") {
    return maybeMessage[0];
  }

  if (typeof maybeMessage === "string") {
    return maybeMessage;
  }

  return fallback;
}

async function requestAuth<TResponse>(
  path: string,
  payload: Record<string, string>,
  fallbackErrorMessage: string,
): Promise<TResponse> {
  if (!API_URL) {
    throw new Error("Chưa thêm env");
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(responseData, fallbackErrorMessage));
  }

  return responseData as TResponse;
}

function getStoredTokens() {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function clearAuthTokens() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken() {
  if (refreshRequest) {
    return refreshRequest;
  }

  const { refreshToken } = getStoredTokens();

  if (!refreshToken) {
    return null;
  }

  refreshRequest = requestAuth<LoginResponse>(
    "/auth/refresh-token",
    { refreshToken },
    "Không thể làm mới phiên đăng nhập",
  )
    .then((tokens) => {
      saveAuthTokens(tokens);
      return tokens;
    })
    .catch(() => {
      clearAuthTokens();
      return null;
    })
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
}

export async function authFetch(path: string, options: AuthRequestOptions = {}) {
  if (!API_URL) {
    throw new Error("Chưa thêm env");
  }

  const { withAuth = false, headers, ...rest } = options;
  const mergedHeaders = new Headers(headers);
  const { accessToken } = getStoredTokens();

  if (withAuth && accessToken) {
    mergedHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
  });

  if (!withAuth || response.status !== 401) {
    return response;
  }

  const refreshedTokens = await refreshAccessToken();

  if (!refreshedTokens) {
    emitSessionExpired();
    throw new SessionExpiredError();
  }

  const retryHeaders = new Headers(headers);
  retryHeaders.set("Authorization", `Bearer ${refreshedTokens.accessToken}`);

  const retryResponse = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: retryHeaders,
  });

  if (retryResponse.status === 401) {
    clearAuthTokens();
    emitSessionExpired();
    throw new SessionExpiredError();
  }

  return retryResponse;
}

export async function authFetchJson<TResponse>(
  path: string,
  options: AuthRequestOptions = {},
  fallbackErrorMessage = "Đã có lỗi xảy ra",
): Promise<TResponse> {
  const response = await authFetch(path, options);
  const responseData: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(responseData, fallbackErrorMessage));
  }

  return responseData as TResponse;
}

export function protectedFetchJson<TResponse>(
  path: string,
  options: ProtectedAuthRequestOptions = {},
  fallbackErrorMessage = "Đã có lỗi xảy ra",
) {
  return authFetchJson<TResponse>(
    path,
    {
      ...options,
      withAuth: true,
    },
    fallbackErrorMessage,
  );
}

export async function register(payload: RegisterPayload) {
  return requestAuth<{ message: string }>("/auth/register", payload, "Đăng ký thất bại");
}

export async function login(payload: LoginPayload) {
  return requestAuth<LoginResponse>("/auth/login", payload, "Đăng nhập thất bại");
}

export async function getProfile() {
  return protectedFetchJson<AuthProfile>(
    "/auth/profile",
    {
      method: "GET",
    },
    "Không thể lấy thông tin người dùng",
  );
}

export async function logout() {
  const { refreshToken } = getStoredTokens();

  if (!refreshToken) {
    clearAuthTokens();
    return;
  }

  try {
    await protectedFetchJson<{ message: string }>(
      "/auth/logout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      },
      "Đăng xuất thất bại",
    );
  } finally {
    clearAuthTokens();
  }
}

export function saveAuthTokens(tokens: LoginResponse) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export async function verifyEmail(token: string) {
  return requestAuth<{ message: string; data: { isVerify: boolean } }>(
    "/auth/verify-email",
    { token },
    "Xác minh email thất bại",
  );
}

export async function resendVerificationEmail(email: string) {
  return requestAuth<{ message: string; data: { email: string } }>(
    "/auth/resend-verification",
    { email },
    "Gửi lại email xác minh thất bại",
  );
}
