"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  ClipboardList,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { getAdminStats, type AdminStats } from "@/services/admin.service";

const USER_ROLE_LABEL: Record<string, string> = {
  CANDIDATE: "Ứng viên",
  RECRUITER: "Nhà tuyển dụng",
  ADMIN: "Admin",
};

const USER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Đã khóa",
  BANNED: "Bị cấm",
};

const JOB_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Nháp",
  OPEN: "Đang tuyển",
  CLOSED: "Đã đóng",
  BLOCKED: "Bị khóa",
};

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xử lý",
  VIEWED: "Đã xem",
  SHORTLISTED: "Lọt vòng hồ sơ",
  INTERVIEW: "Phỏng vấn",
  HIRED: "Đã tuyển",
  REJECTED: "Từ chối",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

// Phân bố theo nhóm: nhãn + bar đơn sắc theo tỷ lệ + giá trị hiển thị trực tiếp
function BreakdownCard({
  title,
  data,
  labels,
}: {
  title: string;
  data: Record<string, number>;
  labels: Record<string, string>;
}) {
  const entries = Object.keys(labels)
    .filter((key) => data[key] !== undefined)
    .map((key) => ({ key, label: labels[key], value: data[key] ?? 0 }));
  // Nhóm không có trong labels (enum mới) vẫn hiển thị thay vì mất dữ liệu
  for (const [key, value] of Object.entries(data)) {
    if (!labels[key]) entries.push({ key, label: key, value });
  }
  const max = Math.max(1, ...entries.map((entry) => entry.value));

  return (
    <Card className="border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-3">
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
        )}
        {entries.map((entry) => (
          <div key={entry.key} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-sm text-muted-foreground">
              {entry.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${(entry.value / max) * 100}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-sm font-semibold text-foreground">
              {formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error ? error.message : "Không thể tải thống kê hệ thống",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-24 text-center text-sm text-muted-foreground">
        Không thể tải thống kê hệ thống
      </div>
    );
  }

  const tiles = [
    {
      label: "Tổng người dùng",
      value: stats.users.total,
      note: `+${formatNumber(stats.users.newLast30Days)} trong 30 ngày`,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Tin tuyển dụng",
      value: stats.jobs.total,
      note: `${formatNumber(stats.jobs.byStatus.OPEN ?? 0)} đang tuyển`,
      icon: Briefcase,
      color: "bg-success/10 text-success",
    },
    {
      label: "Lượt ứng tuyển",
      value: stats.applications.total,
      note: `${formatNumber(stats.applications.byStatus.PENDING ?? 0)} chờ xử lý`,
      icon: ClipboardList,
      color: "bg-accent/10 text-accent",
    },
    {
      label: "Lượt gọi AI",
      value: stats.aiUsage.totalRequests,
      note: `${formatNumber(stats.aiUsage.requestsLast30Days)} trong 30 ngày · ${formatNumber(stats.aiUsage.totalTokens)} tokens`,
      icon: Sparkles,
      color: "bg-warning/10 text-warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Thống kê</h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi các chỉ số chính của hệ thống
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ label, value, note, icon: Icon, color }) => (
          <Card key={label} className="border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(value)}
                </p>
                <p className="truncate text-xs text-muted-foreground">{note}</p>
              </div>
              <div className={`rounded-xl p-2.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownCard
          title="Người dùng theo vai trò"
          data={stats.users.byRole}
          labels={USER_ROLE_LABEL}
        />
        <BreakdownCard
          title="Người dùng theo trạng thái"
          data={stats.users.byStatus}
          labels={USER_STATUS_LABEL}
        />
        <BreakdownCard
          title="Tin tuyển dụng theo trạng thái"
          data={stats.jobs.byStatus}
          labels={JOB_STATUS_LABEL}
        />
        <BreakdownCard
          title="Ứng tuyển theo trạng thái"
          data={stats.applications.byStatus}
          labels={APPLICATION_STATUS_LABEL}
        />
      </div>
    </div>
  );
}
