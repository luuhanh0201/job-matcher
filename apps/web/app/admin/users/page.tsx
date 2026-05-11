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
                    <h1 className="text-2xl font-bold text-(--gray-900)">Quản lý người dùng</h1>
                    <p className="text-sm text-(--gray-600)">Quản lý và kiểm soát tài khoản người dùng</p>
                </div>
                <Button className="w-full gap-2 sm:w-auto bg-(--primary-blue) text-white hover:bg-(--blue-dark)">
                    <Plus className="h-4 w-4" />
                    Thêm người dùng
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--gray-500)" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        className="h-9 w-full rounded-lg border border-(--gray-200) bg-white pl-9 pr-3 text-sm outline-none placeholder:text-(--gray-500) focus:border-(--primary-blue) focus:ring-2 focus:ring-(--primary-blue)/20"
                    />
                </div>
            </div>

            {/* Users Table */}
            <Card className="border border-(--gray-200) bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-(--gray-200) bg-(--gray-50)">
                                <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Tên</th>
                                <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Vai trò</th>
                                <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Trạng thái</th>
                                <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-(--gray-200) hover:bg-(--gray-50) transition-colors">
                                    <td className="px-4 py-3 font-medium text-(--gray-900)">{user.name}</td>
                                    <td className="px-4 py-3 text-(--gray-600)">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.role === "ADMIN" ? "bg-purple-100 text-purple-800" :
                                                user.role === "RECRUITER" ? "bg-blue-100 text-blue-800" :
                                                    "bg-green-100 text-green-800"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${user.status === "Active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50">
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
