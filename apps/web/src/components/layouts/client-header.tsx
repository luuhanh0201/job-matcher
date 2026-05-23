"use client";

import { Bell, ChevronDown, Menu, MessageCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth, getInitials } from "@/context/auth-context";
import Logo from "@/public/images/Logo.svg";

type CandidateHeaderProps = {
  onMenuClick: () => void;
};

export function CandidateHeader({ onMenuClick }: CandidateHeaderProps) {
  const { user } = useAuth();
  const initials = user ? getInitials(user.fullName) : "..";

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-2 border-b border-(--gray-200) bg-white px-3 shadow-sm sm:px-4">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-(--gray-500) transition-colors hover:bg-(--gray-100) lg:hidden"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo */}
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <Image
          src={Logo}
          alt="Logo"
          className="h-20 w-24 sm:h-24 sm:w-28"
          priority
        />
      </Link>

      {/* Search */}
      <div className="relative mx-1 hidden min-w-0 max-w-md flex-1 md:flex lg:max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--gray-500)" />
        <input
          type="search"
          placeholder="Tìm công việc, công ty..."
          className="h-9 w-full rounded-full border-0 bg-(--gray-100) pl-9 pr-4 text-sm outline-none placeholder:text-(--gray-500) focus:ring-2 focus:ring-(--primary-blue)/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          aria-label="Thông báo"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-(--gray-100) text-(--gray-600) transition-colors hover:bg-(--gray-200)"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            1
          </span>
        </button>

        <button
          type="button"
          aria-label="Tin nhắn"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-(--gray-100) text-(--gray-600) transition-colors hover:bg-(--gray-200)"
        >
          <MessageCircle className="h-5 w-5" />
        </button>

        {user ? (
          <button
            type="button"
            title={user.fullName}
            className="flex h-10 items-center gap-1 rounded-full bg-(--gray-100) pl-1 pr-2 text-(--gray-700) transition-colors hover:bg-(--gray-200)"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary-blue) text-xs font-black text-white">
              {initials}
            </span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Link
            href="/login?redirect=%2F"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-(--primary-blue) px-3 text-sm font-bold text-white hover:bg-(--blue-dark)"
          >
            Đăng nhập
          </Link>
        )}

        <Link
          href="/admin/jobs"
          className="hidden items-center gap-2 rounded-xl bg-(--gray-100) px-3 py-1.5 transition-colors hover:bg-(--gray-200) lg:flex"
        >
          <div className="text-left leading-tight">
            {user?.role === "CANDIDATE" ? (
              <>
                <p className="text-[11px] text-(--gray-500)">
                  Bạn đang tìm cơ hội mới?
                </p>
                <p className="text-[12px] font-extrabold text-(--gray-900)">
                  Khám phá việc làm <span aria-hidden>↗</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-(--gray-500)">
                  Bạn là nhà tuyển dụng?
                </p>
                <p className="text-[12px] font-extrabold text-(--gray-900)">
                  Đăng tuyển ngay <span aria-hidden>»</span>
                </p>
              </>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
