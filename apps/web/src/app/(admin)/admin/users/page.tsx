"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Lock, LockOpen, Search, ShieldBan } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAdminUsers,
  updateAdminUserStatus,
  type AdminUser,
  type UserStatus,
} from "@/services/admin.service";
import type { UserRole } from "@/types/user-role.type";

const PAGE_SIZE = 20;
const ALL = "all";

const ROLE_LABEL: Record<UserRole, string> = {
  CANDIDATE: "Ứng viên",
  RECRUITER: "Nhà tuyển dụng",
  ADMIN: "Admin",
};

const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Đã khóa",
  BANNED: "Bị cấm",
};

function getRoleClass(role: UserRole) {
  if (role === "ADMIN") return "bg-accent/15 text-accent";
  if (role === "RECRUITER") return "bg-primary/15 text-primary";
  return "bg-success/15 text-success";
}

function getStatusClass(status: UserStatus) {
  if (status === "ACTIVE") return "bg-success/15 text-success";
  if (status === "BANNED") return "bg-destructive/15 text-destructive";
  return "bg-warning/15 text-warning";
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = useCallback(
    (pageNumber: number) => {
      setLoading(true);
      getAdminUsers({
        keyword: keyword || undefined,
        role: (roleFilter || undefined) as UserRole | undefined,
        status: (statusFilter || undefined) as UserStatus | undefined,
        page: pageNumber,
        limit: PAGE_SIZE,
      })
        .then((result) => {
          setUsers(result.items);
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(result.totalPages);
        })
        .catch((error: unknown) =>
          toast.error(
            error instanceof Error ? error.message : "Không thể tải danh sách người dùng",
          ),
        )
        .finally(() => setLoading(false));
    },
    [keyword, roleFilter, statusFilter],
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleUpdateStatus = async (user: AdminUser, status: UserStatus) => {
    setUpdatingId(user.id);
    try {
      const updated = await updateAdminUserStatus(user.id, status);
      setUsers((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(
        status === "ACTIVE"
          ? `Đã mở khóa tài khoản ${updated.email}`
          : `Đã ${status === "BANNED" ? "cấm" : "khóa"} tài khoản ${updated.email}`,
      );
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật trạng thái",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Quản lý người dùng</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Đang tải..." : `${total} tài khoản`}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Select
          value={roleFilter || ALL}
          onValueChange={(value) => setRoleFilter(value === ALL ? "" : value)}
        >
          <SelectTrigger className="h-9 w-full rounded-lg text-sm sm:w-44">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Mọi vai trò</SelectItem>
            {Object.entries(ROLE_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter || ALL}
          onValueChange={(value) => setStatusFilter(value === ALL ? "" : value)}
        >
          <SelectTrigger className="h-9 w-full rounded-lg text-sm sm:w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Tên</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Vai trò</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Trạng thái</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Ngày tạo</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
              {!loading &&
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border transition-colors hover:bg-muted"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{user.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getRoleClass(user.role)}`}
                      >
                        {ROLE_LABEL[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(user.status)}`}
                      >
                        {STATUS_LABEL[user.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== "ADMIN" && (
                        <div className="flex gap-1">
                          {user.status !== "ACTIVE" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Mở khóa tài khoản"
                              disabled={updatingId === user.id}
                              onClick={() => handleUpdateStatus(user, "ACTIVE")}
                              className="h-7 w-7 text-success hover:bg-success/10"
                            >
                              <LockOpen className="h-4 w-4" />
                            </Button>
                          )}
                          {user.status === "ACTIVE" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Khóa tài khoản"
                              disabled={updatingId === user.id}
                              onClick={() => handleUpdateStatus(user, "INACTIVE")}
                              className="h-7 w-7 text-warning hover:bg-warning/10"
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          )}
                          {user.status !== "BANNED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Cấm tài khoản"
                              disabled={updatingId === user.id}
                              onClick={() => handleUpdateStatus(user, "BANNED")}
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            >
                              <ShieldBan className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Trang {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => fetchUsers(page - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => fetchUsers(page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
