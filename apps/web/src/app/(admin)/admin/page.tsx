"use client";

import { Card } from "@/components/ui/card";
import { BarChart3, Users, Briefcase, TrendingUp } from "lucide-react";

export default function AdminPage() {
    const stats = [
        {
            label: "Tổng người dùng",
            value: "1,234",
            icon: Users,
            color: "bg-blue-100",
            textColor: "text-blue-600",
        },
        {
            label: "Công việc đang mở",
            value: "456",
            icon: Briefcase,
            color: "bg-green-100",
            textColor: "text-green-600",
        },
        {
            label: "Lượt xem",
            value: "12.5K",
            icon: TrendingUp,
            color: "bg-purple-100",
            textColor: "text-purple-600",
        },
        {
            label: "Tỷ lệ chuyển đổi",
            value: "3.2%",
            icon: BarChart3,
            color: "bg-orange-100",
            textColor: "text-orange-600",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-(--gray-900)">Bảng điều khiển</h1>
                <p className="text-sm text-(--gray-600)">Chào mừng bạn đến với bảng quản trị Admin</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map(({ label, value, icon: Icon, color, textColor }) => (
                    <Card
                        key={label}
                        className="border border-(--gray-200) bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-(--gray-600)">{label}</p>
                                <p className="text-2xl font-bold text-(--gray-900)">{value}</p>
                            </div>
                            <div className={`rounded-lg p-3 ${color}`}>
                                <Icon className={`h-6 w-6 ${textColor}`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <Card className="border border-(--gray-200) bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-(--gray-900)">Hoạt động gần đây</h2>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="flex items-center justify-between border-b border-(--gray-100) py-3 last:border-b-0"
                        >
                            <div>
                                <p className="text-sm font-medium text-(--gray-900)">
                                    Người dùng mới đăng ký
                                </p>
                                <p className="text-xs text-(--gray-500)">2 phút trước</p>
                            </div>
                            <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                                Thành công
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* System Status */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border border-(--gray-200) bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-(--gray-900)">Trạng thái hệ thống</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-(--gray-600)">API</span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-xs font-medium text-green-600">Bình thường</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-(--gray-600)">Database</span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-xs font-medium text-green-600">Bình thường</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-(--gray-600)">Storage</span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                <span className="text-xs font-medium text-yellow-600">Cảnh báo</span>
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="border border-(--gray-200) bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-(--gray-900)">Thống kê nhanh</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-(--gray-600)">Thời gian hoạt động</span>
                            <span className="font-semibold text-(--gray-900)">99.98%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-(--gray-600)">Yêu cầu hôm nay</span>
                            <span className="font-semibold text-(--gray-900)">45,234</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-(--gray-600)">Lỗi hôm nay</span>
                            <span className="font-semibold text-(--gray-900)">12</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
