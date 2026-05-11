import type { UserRole } from "@/services/auth.service";

export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
    if (!userRole) {
        return false;
    }
    return userRole === requiredRole;
}

export function isAdmin(userRole: UserRole | undefined): boolean {
    return hasRole(userRole, "ADMIN");
}
