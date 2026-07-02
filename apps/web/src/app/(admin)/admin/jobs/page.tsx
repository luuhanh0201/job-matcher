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
                    <h1 className="text-2xl font-bold text-foreground">Quản lý công việc</h1>
                    <p className="text-sm text-muted-foreground">Quản lý danh sách công việc trên hệ thống</p>
                </div>
                <Button className="w-full gap-2 sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    Thêm công việc
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm công việc..."
                        className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Jobs Table */}
            <Card className="border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted">
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Tiêu đề</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Công ty</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Đã đăng</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Đơn ứng tuyển</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Trạng thái</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id} className="border-b border-border hover:bg-muted transition-colors">
                                    <td className="px-4 py-3 font-medium text-foreground">{job.title}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{job.company}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{job.posted}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-primary">{job.applications}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${job.status === "Active"
                                                ? "bg-success/15 text-success"
                                                : "bg-destructive/15 text-destructive"
                                            }`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <Edit className="h-4 w-4" />
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
