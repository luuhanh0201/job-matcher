"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus, MoreHorizontal, Trash2 } from "lucide-react";

const users = [
    { id: 1, name: "Nguyễn Văn A", email: "nguyena@example.com", role: "CANDIDATE", status: "Active" },
    { id: 2, name: "Trần Thị B", email: "tranb@example.com", role: "RECRUITER", status: "Active" },
    { id: 3, name: "Phạm Văn C", email: "phamc@example.com", role: "CANDIDATE", status: "Inactive" },
    { id: 4, name: "Đỗ Thị D", email: "dod@example.com", role: "RECRUITER", status: "Active" },
    { id: 5, name: "Vũ Văn E", email: "vuve@example.com", role: "CANDIDATE", status: "Active" },
];

export default function UsersPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-foreground">Quản lý người dùng</h1>
                    <p className="text-sm text-muted-foreground">Quản lý và kiểm soát tài khoản người dùng</p>
                </div>
                <Button className="w-full gap-2 sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    Thêm người dùng
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Users Table */}
            <Card className="border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted">
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Tên</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Vai trò</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Trạng thái</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-border hover:bg-muted transition-colors">
                                    <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.role === "ADMIN" ? "bg-accent/15 text-accent" :
                                                user.role === "RECRUITER" ? "bg-primary/15 text-primary" :
                                                    "bg-success/15 text-success"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.status === "Active"
                                                ? "bg-success/15 text-success"
                                                : "bg-destructive/15 text-destructive"
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
