"use client";

import {
    BarChart3,
    Users,
    Briefcase,
    Building2,
    Settings,
    LogOut,
    Home,
    FileText,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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
    { href: "/admin/companies", icon: Building2, label: "Quản lý công ty" },
    { href: "/admin/analytics", icon: BarChart3, label: "Thống kê" },
    { href: "/admin/reports", icon: FileText, label: "Báo cáo" },
    { href: "/admin/ai", icon: BsRobot, label: "AI" },
    { href: "/admin/settings", icon: Settings, label: "Cài đặt" },
];

function AdminNavList({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <nav className="flex h-full flex-col gap-0.5 p-3">
            {navItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                const isAiMenu = href === "/admin/ai";
                const itemClassName = isAiMenu
                    ? isActive
                        ? "bg-gradient-to-r from-accent/15 to-primary/15 text-primary font-semibold ring-1 ring-primary/30"
                        : "bg-gradient-to-r from-accent/10 to-primary/10 text-primary ring-1 ring-primary/20 hover:from-accent/15 hover:to-primary/15"
                    : isActive
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-muted";
                const iconClassName = isAiMenu || isActive ? "text-primary" : "text-muted-foreground";

                return (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${itemClassName}`}
                    >
                        <Icon className={`h-4.5 w-4.5 shrink-0 ${iconClassName}`} />
                        <span className="flex-1">{label}</span>
                        {isAiMenu && (
                            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                                AI
                            </span>
                        )}
                        {isActive && <ChevronRight className="h-4 w-4" />}
                    </Link>
                );
            })}

            <div className="mt-auto border-t border-border pt-3">
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                    <LogOut className="h-4.5 w-4.5" />
                    <span>Đăng xuất</span>
                </Button>
            </div>
        </nav>
    );
}

type AdminSidebarProps = {
    mobileOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function AdminSidebar({ mobileOpen = false, onOpenChange }: AdminSidebarProps) {
    return (
        <>
            <aside className="hidden border-r border-border bg-card lg:block">
                <AdminNavList />
            </aside>

            <Sheet open={mobileOpen} onOpenChange={onOpenChange}>
                <SheetContent side="left" className="w-72 p-0 lg:hidden">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle>Menu quản trị</SheetTitle>
                    </SheetHeader>
                    <AdminNavList onNavigate={() => onOpenChange?.(false)} />
                </SheetContent>
            </Sheet>
        </>
    );
}
