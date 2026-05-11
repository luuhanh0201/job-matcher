"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar } from "lucide-react";

const reports = [
    {
        id: 1,
        title: "Báo cáo người dùng hàng tháng",
        date: "Tháng 5, 2026",
        type: "PDF",
        size: "2.4 MB",
    },
    {
        id: 2,
        title: "Báo cáo công việc",
        date: "Tháng 5, 2026",
        type: "Excel",
        size: "1.8 MB",
    },
    {
        id: 3,
        title: "Báo cáo hoạt động",
        date: "Tháng 4, 2026",
        type: "PDF",
        size: "3.2 MB",
    },
    {
        id: 4,
        title: "Báo cáo doanh thu",
        date: "Tháng 4, 2026",
        type: "Excel",
        size: "1.5 MB",
    },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-(--gray-900)">Báo cáo</h1>
                    <p className="text-sm text-(--gray-600)">Tạo và tải xuống báo cáo từ hệ thống</p>
                </div>
                <Button className="w-full gap-2 sm:w-auto bg-(--primary-blue) text-white hover:bg-(--blue-dark)">
                    <FileText className="h-4 w-4" />
                    Tạo báo cáo mới
                </Button>
            </div>

            {/* Reports List */}
            <div className="space-y-3">
                {reports.map((report) => (
                    <Card
                        key={report.id}
                        className="border border-(--gray-200) bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="flex flex-1 items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--blue-light)">
                                    <FileText className="h-5 w-5 text-(--primary-blue)" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-(--gray-900)">{report.title}</h3>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-(--gray-500)">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{report.date}</span>
                                        <span>•</span>
                                        <span>{report.type}</span>
                                        <span>•</span>
                                        <span>{report.size}</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-(--primary-blue) hover:bg-(--blue-light)"
                            >
                                <Download className="h-4 w-4" />
                                Tải xuống
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Report Templates */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-(--gray-900)">Mẫu báo cáo</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {[
                        { name: "Báo cáo người dùng", description: "Thống kê chi tiết về người dùng" },
                        { name: "Báo cáo công việc", description: "Chi tiết về các bài đăng công việc" },
                        { name: "Báo cáo doanh thu", description: "Thống kê doanh thu và chi phí" },
                        { name: "Báo cáo hoạt động", description: "Thống kê hoạt động hệ thống" },
                    ].map((template) => (
                        <Card
                            key={template.name}
                            className="border border-(--gray-200) bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <h3 className="font-semibold text-(--gray-900)">{template.name}</h3>
                            <p className="mt-1 text-sm text-(--gray-600)">{template.description}</p>
                            <Button size="sm" variant="outline" className="mt-3 w-full">
                                Tạo báo cáo
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
