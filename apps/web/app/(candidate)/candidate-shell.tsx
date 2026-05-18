"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CandidateHeader } from "@/components/layouts/candidate-header";
import { CandidateSidebar } from "@/components/layouts/candidate-sidebar";
import { useAuth } from "@/context/auth-context";

export function CandidateShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showReadonlyNotice, setShowReadonlyNotice] = useState(true);
  const [showInteractionNotice, setShowInteractionNotice] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const isReadonlyHome = pathname === "/" && !user;
  const isRedirectingRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearRedirectTimers = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (isReadonlyHome && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isReadonlyHome, mobileMenuOpen]);

  useEffect(() => {
    if (!isReadonlyHome) {
      setShowReadonlyNotice(true);
      setShowInteractionNotice(false);
      setCountdownSeconds(5);
      clearRedirectTimers();
      isRedirectingRef.current = false;
    }
  }, [isReadonlyHome]);

  useEffect(() => {
    return () => {
      clearRedirectTimers();
    };
  }, []);

  const dismissInteractionNotice = () => {
    clearRedirectTimers();
    setShowInteractionNotice(false);
    setCountdownSeconds(5);
    isRedirectingRef.current = false;
  };

  const startRedirectCountdown = () => {
    clearRedirectTimers();
    setShowInteractionNotice(true);
    setCountdownSeconds(5);
    isRedirectingRef.current = true;

    countdownIntervalRef.current = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    redirectTimerRef.current = setTimeout(() => {
      clearRedirectTimers();
      router.push("/login?redirect=%2F");
    }, 5000);
  };

  const handleReadonlyInteraction = (target: EventTarget | null) => {
    if (!isReadonlyHome || isRedirectingRef.current) {
      return;
    }

    const element = target as HTMLElement | null;
    if (!element) {
      return;
    }

    if (element.closest("[data-readonly-allow='true']")) {
      return;
    }

    const interactive = element.closest("a, button, input, textarea, select, [role='button']");
    if (!interactive) {
      return;
    }

    startRedirectCountdown();
  };

  return (
    <div
      className="min-h-screen bg-(--gray-100)"
      onClickCapture={(e) => {
        const target = e.target as HTMLElement | null;
        const interactive = target?.closest("a, button, input, textarea, select, [role='button']");
        if (!interactive || (interactive as HTMLElement).closest("[data-readonly-allow='true']")) {
          return;
        }

        if (isReadonlyHome) {
          e.preventDefault();
          e.stopPropagation();
          handleReadonlyInteraction(e.target);
        }
      }}
      onKeyDownCapture={(e) => {
        if (!isReadonlyHome || (e.key !== "Enter" && e.key !== " ")) {
          return;
        }

        const target = e.target as HTMLElement | null;
        const interactive = target?.closest("a, button, input, textarea, select, [role='button']");
        if (!interactive || (interactive as HTMLElement).closest("[data-readonly-allow='true']")) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        handleReadonlyInteraction(e.target);
      }}
    >
      <CandidateHeader onMenuClick={() => setMobileMenuOpen(true)} />
      <CandidateSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <button
        type="button"
        aria-label="Đóng menu"
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 lg:hidden ${
          mobileMenuOpen && !isReadonlyHome
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {isReadonlyHome && showReadonlyNotice ? (
        <div className="fixed bottom-4 right-4 z-[60] w-[min(92vw,420px)]" data-readonly-allow="true">
          <div className="rounded-2xl border border-(--gray-200) bg-white/95 p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-(--gray-900)">Bạn đang ở chế độ xem</h2>
                <p className="mt-1 text-sm text-(--gray-500)">
                  Vui lòng đăng nhập để trải nghiệm đầy đủ tính năng của Job Matcher
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReadonlyNotice(false)}
                className="rounded-lg px-2 py-1 text-(--gray-500) hover:bg-(--gray-100)"
              >
                Đóng
              </button>
            </div>
            <Link
              href="/login?redirect=%2F"
              data-readonly-allow="true"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-(--primary-blue) px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-(--blue-dark)"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      ) : null}

      {isReadonlyHome && showInteractionNotice ? (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
          data-readonly-allow="true"
        >
          <div className="w-full max-w-xl rounded-2xl border border-(--accent-orange)/30 bg-white px-5 py-5 text-(--gray-900) shadow-2xl sm:px-6 sm:py-6">
            <p className="text-base font-semibold sm:text-lg">
              Vui lòng đăng nhập để sử dụng tính năng này. Tự động chuyển sau {countdownSeconds} giây.
            </p>
            <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center" data-readonly-allow="true">
              <Link
                href="/login?redirect=%2F"
                data-readonly-allow="true"
                onClick={() => clearRedirectTimers()}
                className="inline-flex items-center justify-center rounded-lg bg-(--primary-blue) px-4 py-2 text-sm font-bold text-white hover:bg-(--blue-dark)"
              >
                Đăng nhập ngay
              </Link>
              <button
                type="button"
                data-readonly-allow="true"
                onClick={dismissInteractionNotice}
                className="inline-flex items-center justify-center rounded-lg border border-(--gray-200) px-4 py-2 text-sm font-semibold text-(--gray-900) hover:bg-(--gray-100)"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="pt-14 lg:pl-60">
        <div className="mx-auto w-full max-w-400 p-3 sm:p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}