"use client";

import {
    BarChart3,
    Users,
    Briefcase,
    Settings,
    LogOut,
    Home,
    FileText,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { BsRobot } from "react-icons/bs";

type NavItem = {
    href: string;
    icon: React.ElementType;
    label: string;
};

const navItems: NavItem[] = [
    { href: "/admin", icon: Home, label: "Tổng quan" },
    { href: "/admin/users", icon: Users, label: "Quản lý người dùng" },
    { href: "/admin/jobs", icon: Briefcase, label: "Quản lý công việc" },
    { href: "/admin/analytics", icon: BarChart3, label: "Thống kê" },
    { href: "/admin/reports", icon: FileText, label: "Báo cáo" },
    { href: "/admin/ai", icon: BsRobot, label: "AI" },
    { href: "/admin/settings", icon: Settings, label: "Cài đặt" },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <aside className="hidden border-r border-(--gray-200) bg-white lg:block">
            <nav className="flex h-full flex-col gap-0.5 p-3">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href || pathname.startsWith(href + "/");
                    const isAiMenu = href === "/admin/ai";
                    const itemClassName = isAiMenu
                        ? isActive
                            ? "bg-gradient-to-r from-cyan-100 to-indigo-100 text-indigo-700 font-semibold ring-1 ring-indigo-300"
                            : "bg-gradient-to-r from-cyan-50 to-indigo-50 text-indigo-700 ring-1 ring-indigo-200 hover:from-cyan-100 hover:to-indigo-100"
                        : isActive
                            ? "bg-(--blue-light) font-semibold text-(--primary-blue)"
                            : "text-(--gray-700) hover:bg-(--gray-100) hover:text-(--gray-900)";
                    const iconClassName = isAiMenu || isActive ? "text-indigo-600" : "text-(--gray-500)";

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${itemClassName}`}
                        >
                            <Icon className={`h-4.5 w-4.5 shrink-0 ${iconClassName}`} />
                            <span className="flex-1">{label}</span>
                            {isAiMenu && (
                                <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                    AI
                                </span>
                            )}
                            {isActive && <ChevronRight className="h-4 w-4" />}
                        </Link>
                    );
                })}

                <div className="mt-auto border-t border-(--gray-200) pt-3">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm text-(--gray-700) hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut className="h-4.5 w-4.5" />
                        <span>Đăng xuất</span>
                    </Button>
                </div>
            </nav>
        </aside>
    );
}
