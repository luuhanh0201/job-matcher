"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  type AuthProfile,
  clearAuthTokens,
  getProfile,
  logout as authLogout,
} from "@/services/auth.service";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: AuthProfile }
  | { status: "unauthenticated" };

type AuthContextValue = {
  user: AuthProfile | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Module-level cache — survives client-side navigations
let cachedUser: AuthProfile | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(
    cachedUser
      ? { status: "authenticated", user: cachedUser }
      : { status: "loading" },
  );

  useEffect(() => {
    // Already resolved from cache — no need to re-fetch
    if (cachedUser) return;

    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!accessToken) {
      setState({ status: "unauthenticated" });
      router.replace("/login");
      return;
    }

    getProfile()
      .then((user) => {
        cachedUser = user;
        setState({ status: "authenticated", user });
      })
      .catch(() => {
        clearAuthTokens();
        setState({ status: "unauthenticated" });
        router.replace("/login");
      });
  }, [router]);

  const logout = useCallback(async () => {
    await authLogout().catch(() => {});
    cachedUser = null;
    setState({ status: "unauthenticated" });
    router.replace("/login");
  }, [router]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--gray-100)">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-(--gray-200) border-t-(--primary-blue)" />
          <p className="text-sm font-medium text-(--gray-500)">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (state.status === "unauthenticated") {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoading: false,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";

  if (parts.length <= 1) return first.slice(0, 2).toUpperCase();

  const last = parts[parts.length - 1] ?? "";
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}
