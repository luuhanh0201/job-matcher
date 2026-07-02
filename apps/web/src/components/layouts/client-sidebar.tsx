"use client";

import { useState } from "react";

import {
  ChevronDown,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, getInitials } from "@/context/auth-context";
import { RoleBadge } from "@/components/common/role-badge";
import {
  getClientNavItems,
  getClientProfileHref,
  NavItem,
  SubItem,
} from "@/components/layouts/client-sidebar.config";

function isPathMatch(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function getBestMatchedChild(pathname: string, children?: SubItem[]) {
  if (!children?.length) return null;

  const matched = children
    .filter((child) => isPathMatch(pathname, child.href))
    .sort((a, b) => b.href.length - a.href.length);

  return matched[0] ?? null;
}

type CandidateSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export function CandidateSidebar({ mobileOpen, onClose }: CandidateSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const initials = user ? getInitials(user.fullName) : "..";
  const navItems = getClientNavItems(user?.role);
  const profileHref = getClientProfileHref(user?.role);

  return (
    <aside
      className={`fixed left-0 top-14 z-50 flex h-[calc(100vh-3.5rem)] w-72 flex-col overflow-y-auto border-r border-border bg-card px-3 py-4 shadow-xl transition-transform duration-300 ease-out lg:w-60 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
      aria-hidden={!mobileOpen}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng menu"
        className="mb-3 flex h-10 w-10 items-center justify-center self-end rounded-lg text-muted-foreground transition-colors hover:bg-muted lg:hidden"
      >
        <X className="h-5 w-5" />
      </button>

      {/* User card */}
      {user ? (
        <Link
          href={profileHref}
          onClick={onClose}
          className="mb-3 flex flex-col items-center gap-2 rounded-2xl border border-border px-4 py-5 transition-colors hover:bg-muted"
        >
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar}
              alt={user.fullName}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground">
              {initials}
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user?.provider ? "" : user.email}</p>
            {user.role && (
              <div className="mt-1.5 flex justify-center">
                <RoleBadge role={user.role} />
              </div>
            )}
          </div>
        </Link>
      ) : (
        <div className="mb-3 rounded-2xl border border-border px-4 py-5 text-center">
          <p className="text-sm font-semibold text-foreground">Bạn chưa đăng nhập</p>
          <p className="mt-1 text-xs text-muted-foreground">Đăng nhập ngay</p>
          <Link
            href="/login?redirect=%2F"
            onClick={onClose}
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Đăng nhập
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => {
          const { icon: Icon, label, badge, highlight, children, href } = item;
          const bestMatchedChild = getBestMatchedChild(pathname, children);

          const isActive = href
            ? href === "/jobs"
              ? pathname === "/jobs" || pathname.startsWith("/jobs/")
              : isPathMatch(pathname, href)
            : Boolean(bestMatchedChild);

          // Items with children (dropdown)
          if (children) {
            return (
              <DropdownItem
                key={label}
                item={item}
                isActive={!!isActive}
                pathname={pathname}
                activeChildHref={bestMatchedChild?.href}
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
                    ? "bg-linear-to-r from-primary to-accent text-primary-foreground shadow-md"
                    : "bg-linear-to-r from-primary/10 to-accent/10 text-accent hover:from-primary/20 hover:to-accent/20"
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
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="truncate">{label}</span>
              </div>
              {badge ? (
                <span className="shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1 text-[11px] font-bold text-warning-foreground">
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
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
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
  activeChildHref,
  onClose,
}: {
  item: NavItem;
  isActive: boolean;
  pathname: string;
  activeChildHref?: string;
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
            ? "bg-primary/10 font-semibold text-primary"
            : "text-foreground hover:bg-muted"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
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
            const childActive = activeChildHref
              ? activeChildHref === child.href
              : isPathMatch(pathname, child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className={`rounded-lg px-3 py-2 text-sm leading-none transition-colors ${
                  childActive
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-muted"
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
