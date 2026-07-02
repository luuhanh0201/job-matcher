"use client";

import { Bell, ChevronDown, Menu, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, getInitials } from "@/context/auth-context";
import { Logo } from "@/components/logo";
import { Button } from "../ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type CandidateHeaderProps = {
  onMenuClick: () => void;
};

export function CandidateHeader({ onMenuClick }: CandidateHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const initials = user ? getInitials(user.fullName) : "..";

  const handleApplyRecruiter = () => {
    if (!user) {
      router.push("/login?redirect=%2Fprofile%2Frecruiter%2Fapply");
      return;
    }

    if (user.role === "RECRUITER") {
      router.push("/recruiter");
      return;
    }

    router.push("/profile/recruiter/apply");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-2 border-b border-border bg-card px-3 shadow-sm sm:px-4">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted lg:hidden"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo */}
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <Logo className="h-11 w-auto sm:h-12" priority />
      </Link>

      {/* Search */}
      <div className="relative mx-1 hidden min-w-0 max-w-md flex-1 md:flex lg:max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Tìm công việc, công ty..."
          className="h-9 w-full rounded-full border-0 bg-muted pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <ThemeToggle />

        <button
          type="button"
          aria-label="Thông báo"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-border"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
            1
          </span>
        </button>

        <button
          type="button"
          aria-label="Tin nhắn"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-border"
        >
          <MessageCircle className="h-5 w-5" />
        </button>

        {user ? (
          <button
            type="button"
            title={user.fullName}
            className="flex h-10 items-center gap-1 rounded-full bg-muted pl-1 pr-2 text-foreground transition-colors hover:bg-border"
          >
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                {initials}
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Link
            href="/login?redirect=%2F"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-primary px-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
          >
            Đăng nhập
          </Link>
        )}

        {user ? (
          <Button
            className="hidden items-center gap-2 bg-muted px-3 py-5.5 text-foreground transition-colors hover:bg-border lg:flex"
            onClick={handleApplyRecruiter}
          >
            <div className="text-left leading-tight">
              {user.role === "RECRUITER" ? (
                <>
                  <p className="text-[11px] text-muted-foreground">Không gian tuyển dụng</p>
                  <p className="text-[12px] font-extrabold text-foreground">
                    Vào dashboard <span aria-hidden>»</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] text-muted-foreground">Bạn là nhà tuyển dụng?</p>
                  <p className="text-[12px] font-extrabold text-foreground">
                    Đăng ký ngay <span aria-hidden>»</span>
                  </p>
                </>
              )}
            </div>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
