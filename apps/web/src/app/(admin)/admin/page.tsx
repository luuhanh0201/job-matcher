"use client";

import { Card } from "@/components/ui/card";
import { BarChart3, Users, Briefcase, TrendingUp } from "lucide-react";

export default function AdminPage() {
    const stats = [
        {
            label: "Tổng người dùng",
            value: "1,234",
            icon: Users,
            color: "bg-primary/10",
            textColor: "text-primary",
        },
        {
            label: "Công việc đang mở",
            value: "456",
            icon: Briefcase,
            color: "bg-success/10",
            textColor: "text-success",
        },
        {
            label: "Lượt xem",
            value: "12.5K",
            icon: TrendingUp,
            color: "bg-accent/10",
            textColor: "text-accent",
        },
        {
            label: "Tỷ lệ chuyển đổi",
            value: "3.2%",
            icon: BarChart3,
            color: "bg-warning/10",
            textColor: "text-warning",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển</h1>
                <p className="text-sm text-muted-foreground">Chào mừng bạn đến với bảng quản trị Admin</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map(({ label, value, icon: Icon, color, textColor }) => (
                    <Card
                        key={label}
                        className="border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                                <p className="text-2xl font-bold text-foreground">{value}</p>
                            </div>
                            <div className={`rounded-lg p-3 ${color}`}>
                                <Icon className={`h-6 w-6 ${textColor}`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <Card className="border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-foreground">Hoạt động gần đây</h2>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div
                            key={item}
                            className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
                        >
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Người dùng mới đăng ký
                                </p>
                                <p className="text-xs text-muted-foreground">2 phút trước</p>
                            </div>
                            <span className="inline-flex items-center justify-center rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                                Thành công
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* System Status */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-foreground">Trạng thái hệ thống</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">API</span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-success" />
                                <span className="text-xs font-medium text-success">Bình thường</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Database</span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-success" />
                                <span className="text-xs font-medium text-success">Bình thường</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Storage</span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-warning" />
                                <span className="text-xs font-medium text-warning">Cảnh báo</span>
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-foreground">Thống kê nhanh</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Thời gian hoạt động</span>
                            <span className="font-semibold text-foreground">99.98%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Yêu cầu hôm nay</span>
                            <span className="font-semibold text-foreground">45,234</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Lỗi hôm nay</span>
                            <span className="font-semibold text-foreground">12</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
