"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AuthProfile } from "@/services/auth.service";
import { useAuth } from "@/context/auth-context";
import { getInitials } from "@/context/auth-context";

type AdminHeaderProps = {
    user: AuthProfile;
};

export function AdminHeader({ user }: AdminHeaderProps) {
    const router = useRouter();
    const { logout } = useAuth();
    const initials = getInitials(user.fullName);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-(--gray-200) bg-white px-4 shadow-sm">
            <div className="flex items-center gap-3">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary-blue) text-sm font-bold text-white">
                        ⚙️
                    </div>
                    <span className="hidden font-semibold text-(--gray-900) sm:block">Admin</span>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-(--gray-500) hover:bg-(--gray-100)"
                    title="Cài đặt"
                >
                    <Settings className="h-5 w-5" />
                </Button>

                <button
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-(--primary-blue) text-sm font-bold text-white hover:bg-(--blue-dark)"
                    title={user.fullName}
                >
                    {initials}
                </button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-(--gray-500) hover:bg-(--gray-100) hover:text-red-600"
                    onClick={handleLogout}
                    title="Đăng xuất"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
