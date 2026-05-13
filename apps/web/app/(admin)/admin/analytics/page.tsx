"use client";

import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Briefcase, Eye, Heart } from "lucide-react";

export default function AnalyticsPage() {
    const metrics = [
        {
            label: "Tổng lượt xem",
            value: "245,890",
            change: "+12.5%",
            isPositive: true,
            icon: Eye,
            color: "bg-blue-100 text-blue-600",
        },
        {
            label: "Lượt yêu thích",
            value: "45,230",
            change: "+8.2%",
            isPositive: true,
            icon: Heart,
            color: "bg-red-100 text-red-600",
        },
        {
            label: "Ứng tuyển mới",
            value: "1,234",
            change: "+3.1%",
            isPositive: true,
            icon: Briefcase,
            color: "bg-green-100 text-green-600",
        },
        {
            label: "Người dùng hoạt động",
            value: "8,543",
            change: "+15.3%",
            isPositive: true,
            icon: Users,
            color: "bg-purple-100 text-purple-600",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-(--gray-900)">Thống kê</h1>
                <p className="text-sm text-(--gray-600)">Theo dõi các chỉ số chính của hệ thống</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map(({ label, value, change, isPositive, icon: Icon, color }) => (
                    <Card key={label} className="border border-(--gray-200) bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-(--gray-600)">{label}</p>
                                <p className="text-2xl font-bold text-(--gray-900)">{value}</p>
                                <p className={`text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                    {change}
                                </p>
                            </div>
                            <div className={`rounded-lg p-3 ${color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="border border-(--gray-200) bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-(--gray-900)">Lượt xem theo ngày</h3>
                    <div className="flex h-64 items-end justify-around gap-2">
                        {[45, 52, 48, 65, 58, 72, 68].map((value, idx) => (
                            <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                                <div
                                    className="w-full rounded-t-lg bg-(--primary-blue)"
                                    style={{ height: `${(value / 72) * 100}%` }}
                                />
                                <span className="text-xs text-(--gray-500)">{idx + 1}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="border border-(--gray-200) bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-(--gray-900)">Phân bố tỷ lệ</h3>
                    <div className="space-y-3">
                        {[
                            { label: "CANDIDATE", value: 45, color: "bg-blue-500" },
                            { label: "RECRUITER", value: 35, color: "bg-green-500" },
                            { label: "Khác", value: 20, color: "bg-gray-500" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-(--gray-900)">{label}</span>
                                    <span className="text-(--gray-600)">{value}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-(--gray-200)">
                                    <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
