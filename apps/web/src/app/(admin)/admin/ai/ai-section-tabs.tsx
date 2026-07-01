"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/ai/providers", label: "Quản lý AI" },
  { href: "/admin/ai/usage", label: "Thống kê sử dụng" },
];

export function AiSectionTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-(--gray-200)">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-(--primary-blue) text-(--primary-blue)"
                : "border-transparent text-(--gray-600) hover:text-(--gray-900)"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
