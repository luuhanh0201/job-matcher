"use client";

import { LogOut, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { getInitials } from "@/context/auth-context";
import { AuthProfile } from "@/types/auth-profile.type";

type AdminHeaderProps = {
    user: AuthProfile;
    onMenuClick?: () => void;
};

export function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
    const router = useRouter();
    const { logout } = useAuth();
    const initials = getInitials(user.fullName);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-muted lg:hidden"
                    aria-label="Mở menu"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <Link href="/admin" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                        ⚙️
                    </div>
                    <span className="hidden font-semibold text-foreground sm:block">Admin</span>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <ThemeToggle />

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-muted"
                    title="Cài đặt"
                >
                    <Settings className="h-5 w-5" />
                </Button>

                <button
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90"
                    title={user.fullName}
                >
                    {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                    title="Đăng xuất"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
