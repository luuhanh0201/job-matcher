"use client";

import { Card } from "@/components/ui/card";
import { Eye, Heart, Users, Briefcase } from "lucide-react";

export default function AnalyticsPage() {
    const metrics = [
        {
            label: "Tổng lượt xem",
            value: "245,890",
            change: "+12.5%",
            isPositive: true,
            icon: Eye,
            color: "bg-primary/10 text-primary",
        },
        {
            label: "Lượt yêu thích",
            value: "45,230",
            change: "+8.2%",
            isPositive: true,
            icon: Heart,
            color: "bg-destructive/10 text-destructive",
        },
        {
            label: "Ứng tuyển mới",
            value: "1,234",
            change: "+3.1%",
            isPositive: true,
            icon: Briefcase,
            color: "bg-success/10 text-success",
        },
        {
            label: "Người dùng hoạt động",
            value: "8,543",
            change: "+15.3%",
            isPositive: true,
            icon: Users,
            color: "bg-accent/10 text-accent",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Thống kê</h1>
                <p className="text-sm text-muted-foreground">Theo dõi các chỉ số chính của hệ thống</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map(({ label, value, change, isPositive, icon: Icon, color }) => (
                    <Card key={label} className="border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                                <p className="text-2xl font-bold text-foreground">{value}</p>
                                <p className={`text-xs font-semibold ${isPositive ? "text-success" : "text-destructive"}`}>
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
                <Card className="border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-foreground">Lượt xem theo ngày</h3>
                    <div className="flex h-64 items-end justify-around gap-2">
                        {[45, 52, 48, 65, 58, 72, 68].map((value, idx) => (
                            <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                                <div
                                    className="w-full rounded-t-lg bg-primary"
                                    style={{ height: `${(value / 72) * 100}%` }}
                                />
                                <span className="text-xs text-muted-foreground">{idx + 1}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-foreground">Phân bố tỷ lệ</h3>
                    <div className="space-y-3">
                        {[
                            { label: "CANDIDATE", value: 45, color: "bg-primary" },
                            { label: "RECRUITER", value: 35, color: "bg-success" },
                            { label: "Khác", value: 20, color: "bg-muted-foreground" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-foreground">{label}</span>
                                    <span className="text-muted-foreground">{value}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted">
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
