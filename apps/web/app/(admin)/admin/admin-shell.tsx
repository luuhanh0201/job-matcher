"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AdminHeader } from "@/components/layouts/admin-header";
import { isAdmin } from "@/lib/role-check";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        // Redirect to not-found if user doesn't have admin role
        if (!isLoading && (!user || !isAdmin(user.role))) {
            router.replace("/not-found");
        }
    }, [user, isLoading, router]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-(--gray-100)">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-(--gray-200) border-t-(--primary-blue)" />
                    <p className="text-sm font-medium text-(--gray-500)">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Redirect happening - show loading state
    if (!user || !isAdmin(user.role)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-(--gray-100)">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-(--gray-200) border-t-(--primary-blue)" />
                    <p className="text-sm font-medium text-(--gray-500)">Đang chuyển hướng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid min-h-screen grid-cols-1 grid-rows-[auto_1fr] lg:grid-cols-[280px_1fr] lg:grid-rows-[auto_1fr]">
            <div className="col-span-full lg:col-span-2">
                <AdminHeader user={user} />
            </div>
            <AdminSidebar />
            <main className="overflow-auto bg-(--gray-50) p-4 sm:p-6">
                {children}
            </main>
        </div>
    );
}
