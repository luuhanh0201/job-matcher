"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CandidateHeader } from "@/components/layouts/client-header";
import { CandidateSidebar } from "@/components/layouts/client-sidebar";
import { useAuth } from "@/context/auth-context";

export function RecruiterShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user && user.role !== "RECRUITER") {
      router.replace("/not-found");
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm font-medium text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (user.role !== "RECRUITER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm font-medium text-muted-foreground">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CandidateHeader onMenuClick={() => setMobileMenuOpen(true)} />
      <CandidateSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <button
        type="button"
        aria-label="Đóng menu"
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 lg:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <main className="pt-14 lg:pl-60">
        <div className="mx-auto w-full max-w-400 p-3 sm:p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
