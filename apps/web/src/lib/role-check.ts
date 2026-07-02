import { UserRole } from "@/types/user-role.type";

export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
    if (!userRole) {
        return false;
    }
    return userRole === requiredRole;
}

export function isAdmin(userRole: UserRole | undefined): boolean {
    return hasRole(userRole, "ADMIN");
}

// Trang đích mặc định sau đăng nhập theo vai trò (khi không có redirect cụ thể).
export function getHomeRouteForRole(userRole: UserRole | undefined): string {
    if (userRole === "ADMIN") {
        return "/admin";
    }
    if (userRole === "RECRUITER") {
        return "/recruiter";
    }
    return "/";
}
