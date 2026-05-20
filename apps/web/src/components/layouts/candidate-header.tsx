"use client";

import { Bell, Briefcase, Home, Menu, Search, ShoppingBag, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth, getInitials } from "@/context/auth-context";
import Logo from "@/public/images/Logo.svg";

type CandidateHeaderProps = {
  onMenuClick: () => void;
};

export function CandidateHeader({ onMenuClick }: CandidateHeaderProps) {
  const pathname = usePathname();
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
        <Image src={Logo} alt="Logo" className="h-24 w-24 sm:h-28 sm:w-32" priority />
      </Link>

      {/* Search */}
      <div className="relative mx-2 hidden min-w-0 flex-1 max-w-xl md:flex">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--gray-500)" />
        <input
          type="search"
          placeholder="Tìm kiếm bạn bè, bài viết, công việc..."
          className="h-9 w-full rounded-full border-0 bg-(--gray-100) pl-9 pr-4 text-sm outline-none placeholder:text-(--gray-500) focus:ring-2 focus:ring-(--primary-blue)/30"
        />
      </div>

      {/* Spacer */}
      <div className="hidden flex-1 lg:block" />

      {/* Nav icons */}
      <nav className="ml-auto flex items-center gap-1">
        <Link
          href="/jobs"
          className={`relative flex h-10 w-10 flex-col items-center justify-center rounded-lg transition-colors hover:bg-(--gray-100) sm:w-12 ${
            pathname.startsWith("/jobs") ? "text-(--primary-blue)" : "text-(--gray-500)"
          }`}
        >
          <Home className="h-5 w-5" />
          {pathname.startsWith("/jobs") && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-(--primary-blue)" />
          )}
        </Link>

        <button className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-(--gray-500) transition-colors hover:bg-(--gray-100) sm:flex">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            5
          </span>
        </button>

        <button className="hidden h-10 w-10 items-center justify-center rounded-lg text-(--gray-500) transition-colors hover:bg-(--gray-100) md:flex">
          <Briefcase className="h-5 w-5" />
        </button>

        <button className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-(--gray-500) transition-colors hover:bg-(--gray-100) sm:flex">
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            2
          </span>
        </button>
      </nav>

      {/* Upload CV button */}
      {user ? (
        <Button
          size="sm"
          className="ml-1 hidden h-8 gap-1.5 rounded-full bg-(--accent-green) text-sm font-bold text-white hover:bg-(--accent-green)/90 sm:inline-flex"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload CV
        </Button>
      ) : null}

      {/* Avatar / Login */}
      {user ? (
        <button
          title={user.fullName}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--primary-blue) text-sm font-black text-white"
        >
          {initials}
        </button>
      ) : (
        <Link
          href="/login?redirect=%2F"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-(--primary-blue) px-3 text-sm font-bold text-white hover:bg-(--blue-dark)"
        >
          Đăng nhập
        </Link>
      )}
    </header>
  );
}
