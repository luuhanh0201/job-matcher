"use client";

import { useState } from "react";

import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  X,
  Home,
  LogOut,
  MessageCircle,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, getInitials } from "@/context/auth-context";
import { RoleBadge } from "@/components/common/role-badge";

type SubItem = {
  href: string;
  label: string;
};

type NavItem = {
  href?: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  highlight?: boolean;
  children?: SubItem[];
};

const navItems: NavItem[] = [
  { href: "/", icon: Home, label: "Trang chủ" },
  {
    icon: User,
    label: "Hồ sơ cá nhân",
    children: [
      { href: "/profile/me", label: "Thông tin cá nhân" },
      { href: "/profile/job-matches", label: "Công việc phù hợp" },
      { href: "/profile/security", label: "Bảo mật" },
    ],
  },
  // { href: "/friends", icon: Users, label: "Bạn bè", badge: 2 },
  { icon: Briefcase, label: "Việc làm",
    children: [
      { href: "/jobs/it", label: "IT-Phần mềm" },
      { href: "/jobs/sales", label: "Kinh doanh - bán hàng" },
      { href: "/jobs/hospitality", label: "Nhà hàng - khách sạn" },
      { href: "/jobs/education", label: "Giáo dục - đào tạo" },
      { href: "/jobs/general", label: "Việc làm phổ thông" },
    ]
  },
  { href: "/messages", icon: MessageCircle, label: "Tin nhắn", badge: 2 },
  { href: "/ai-cv", icon: Sparkles, label: "AI CV Analyzer", highlight: true },
  // { href: "/invest", icon: TrendingUp, label: "Đầu tư" },
  { href: "/settings", icon: Settings, label: "Cài đặt" },
];

type CandidateSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function CandidateSidebar({ mobileOpen, onClose }: CandidateSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const initials = user ? getInitials(user.fullName) : "..";

  return (
    <aside
      className={`fixed left-0 top-14 z-50 flex h-[calc(100vh-3.5rem)] w-72 flex-col overflow-y-auto border-r border-(--gray-200) bg-white px-3 py-4 shadow-xl transition-transform duration-300 ease-out lg:w-60 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
      aria-hidden={!mobileOpen}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng menu"
        className="mb-3 flex h-10 w-10 items-center justify-center self-end rounded-lg text-(--gray-500) transition-colors hover:bg-(--gray-100) lg:hidden"
      >
        <X className="h-5 w-5" />
      </button>

      {/* User card */}
      {user ? (
        <Link
          href="/profile"
          onClick={onClose}
          className="mb-3 flex flex-col items-center gap-2 rounded-2xl border border-(--gray-200) px-4 py-5 transition-colors hover:bg-(--gray-100)"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--primary-blue) text-lg font-black text-white">
            {initials}
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-(--gray-900)">{user.fullName}</p>
            <p className="text-xs text-(--gray-500)">{user.email}</p>
            {user.role && (
              <div className="mt-1.5 flex justify-center">
                <RoleBadge role={user.role} />
              </div>
            )}
          </div>
        </Link>
      ) : (
        <div className="mb-3 rounded-2xl border border-(--gray-200) px-4 py-5 text-center">
          <p className="text-sm font-semibold text-(--gray-900)">Bạn chưa đăng nhập</p>
          <p className="mt-1 text-xs text-(--gray-500)">Đăng nhập ngay</p>
          <Link
            href="/login?redirect=%2F"
            onClick={onClose}
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-(--primary-blue) px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-(--blue-dark)"
          >
            Đăng nhập
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => {
          const { icon: Icon, label, badge, highlight, children, href } = item;

          const isActive = href
            ? href === "/jobs"
              ? pathname === "/jobs" || pathname.startsWith("/jobs/")
              : pathname === href || pathname.startsWith(href + "/")
            : children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));

          // Items with children (dropdown)
          if (children) {
            return (
              <DropdownItem
                key={label}
                item={item}
                isActive={!!isActive}
                pathname={pathname}
                onClose={onClose}
              />
            );
          }

          if (highlight) {
            return (
              <Link
                key={href}
                href={href!}
                onClick={onClose}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold leading-none transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-(--primary-blue) to-(--accent-purple) text-white shadow-md"
                    : "bg-gradient-to-r from-(--primary-blue)/10 to-(--accent-purple)/10 text-(--accent-purple) hover:from-(--primary-blue)/20 hover:to-(--accent-purple)/20"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href!}
              onClick={onClose}
              className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium leading-none transition-colors ${
                isActive
                  ? "bg-(--blue-light) font-semibold text-(--primary-blue)"
                  : "text-(--gray-900) hover:bg-(--gray-100)"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-(--primary-blue)" : "text-(--gray-500)"}`}
                />
                <span className="truncate">{label}</span>
              </div>
              {badge ? (
                <span className="shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--accent-orange) px-1 text-[11px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      {user ? (
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          Đăng xuất
        </button>
      ) : null}
    </aside>
  );
}

function DropdownItem({
  item,
  isActive,
  pathname,
  onClose,
}: {
  item: NavItem;
  isActive: boolean;
  pathname: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(isActive);
  const Icon = item.icon;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium leading-none transition-colors ${
          isActive
            ? "bg-(--blue-light) font-semibold text-(--primary-blue)"
            : "text-(--gray-900) hover:bg-(--gray-100)"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-(--primary-blue)" : "text-(--gray-500)"}`}
          />
          <span className="truncate">{item.label}</span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && item.children && (
        <div className="ml-8 mt-0.5 flex flex-col gap-0.5">
          {item.children.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className={`rounded-lg px-3 py-2 text-sm leading-none transition-colors ${
                  childActive
                    ? "bg-(--blue-light) font-semibold text-(--primary-blue)"
                    : "text-(--gray-600) hover:bg-(--gray-100)"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
