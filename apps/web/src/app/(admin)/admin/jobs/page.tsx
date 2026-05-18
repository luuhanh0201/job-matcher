"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

const jobs = [
    { id: 1, title: "Senior Developer", company: "Tech Corp", posted: "2 ngày trước", applications: 24, status: "Active" },
    { id: 2, title: "UX/UI Designer", company: "Design Studio", posted: "1 ngày trước", applications: 15, status: "Active" },
    { id: 3, title: "Product Manager", company: "StartUp X", posted: "5 ngày trước", applications: 8, status: "Inactive" },
    { id: 4, title: "DevOps Engineer", company: "Cloud Services", posted: "3 ngày trước", applications: 31, status: "Active" },
    { id: 5, title: "Frontend Developer", company: "Web Agency", posted: "1 tuần trước", applications: 42, status: "Active" },
];

export default function JobsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-(--gray-900)">Quản lý công việc</h1>
                    <p className="text-sm text-(--gray-600)">Quản lý danh sách công việc trên hệ thống</p>
                </div>
                <Button className="w-full gap-2 sm:w-auto bg-(--primary-blue) text-white hover:bg-(--blue-dark)">
                    <Plus className="h-4 w-4" />
                    Thêm công việc
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--gray-500)" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm công việc..."
                        className="h-9 w-full rounded-lg border border-(--gray-200) bg-white pl-9 pr-3 text-sm outline-none placeholder:text-(--gray-500) focus:border-(--primary-blue) focus:ring-2 focus:ring-(--primary-blue)/20"
                    />
                </div>
            </div>

            {/* Jobs Table */}
            <Card className="border border-(--gray-200) bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-(--gray-200) bg-(--gray-50)">
                                <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Tiêu đề</th>
                                <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Công ty</th>
                                <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Đã đăng</th>
                                <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Đơn ứng tuyển</th>
                                <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Trạng thái</th>
                                <th className="px-4 py-3 text-left font-semibold text-(--gray-900)">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id} className="border-b border-(--gray-200) hover:bg-(--gray-50) transition-colors">
                                    <td className="px-4 py-3 font-medium text-(--gray-900)">{job.title}</td>
                                    <td className="px-4 py-3 text-(--gray-600)">{job.company}</td>
                                    <td className="px-4 py-3 text-xs text-(--gray-500)">{job.posted}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-(--primary-blue)">{job.applications}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${job.status === "Active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <Edit className="h-4 w-4" />
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
