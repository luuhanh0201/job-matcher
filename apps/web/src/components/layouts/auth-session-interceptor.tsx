"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/services/auth.service";

function isAuthPage(pathname: string | null) {
  return pathname?.startsWith("/login") || pathname?.startsWith("/register");
}

export function AuthSessionInterceptor() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleSessionExpired = () => {
      if (isAuthPage(pathname)) {
        return;
      }

      const redirectQuery = pathname ? `&redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login?sessionExpired=1${redirectQuery}`);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [pathname, router]);

  return null;
}
