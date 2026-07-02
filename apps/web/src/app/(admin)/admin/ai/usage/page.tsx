"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { BsRobot } from "react-icons/bs";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getAiUsageSeriesByProvider,
  getAiUsageSummary,
} from "@/services/ai-usage.service";
import type {
  AiUsageFeature,
  AiUsageGroupBy,
  AiUsagePeriodStats,
  AiUsageSeriesByProviderPoint,
  AiUsageSummary,
} from "@/types/ai-usage";
import { AiSectionTabs } from "../ai-section-tabs";

const FEATURE_LABEL: Record<AiUsageFeature, string> = {
  CHAT: "Chat",
  JOB_MATCHING: "Gợi ý việc làm",
  CV_EXTRACTION: "Trích xuất CV",
  CV_ANALYSIS: "Phân tích CV",
  CONNECTION_TEST: "Kiểm tra kết nối",
};

const GROUP_BY_OPTIONS: { value: AiUsageGroupBy; label: string }[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
];

function formatPeriodLabel(iso: string, groupBy: AiUsageGroupBy): string {
  const date = new Date(iso);
  if (groupBy === "month") {
    return date.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" });
  }
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function formatNumber(n: number): string {
  return n.toLocaleString("vi-VN");
}

const PROVIDER_COLOR_PALETTE = [
  "#3b82f6",
  "#a855f7",
  "#10b981",
  "#ec4899",
  "#eab308",
  "#06b6d4",
  "#ef4444",
];

// Màu cố định theo nhà cung cấp (khớp màu badge ở trang Quản lý AI), để cùng
// 1 vendor luôn hiển thị cùng 1 màu dù đổi tên gợi nhớ.
const VENDOR_COLOR: Record<string, string> = {
  ANTHROPIC: "#f97316",
  OPENAI: "#10b981",
  GEMINI: "#6366f1",
  GROQ: "#F55036",
};

// Hash tên provider thành 1 màu cố định trong bảng màu (dùng khi vendor không
// nằm trong VENDOR_COLOR, hoặc không xác định được vendor).
function getColorForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PROVIDER_COLOR_PALETTE[hash % PROVIDER_COLOR_PALETTE.length] ?? PROVIDER_COLOR_PALETTE[0]!;
}

function getColorForProvider(providerName: string, vendor?: string): string {
  if (vendor && VENDOR_COLOR[vendor]) {
    return VENDOR_COLOR[vendor];
  }
  return getColorForKey(providerName);
}

function StatCard({
  label,
  stats,
  loading,
}: {
  label: string;
  stats?: AiUsagePeriodStats;
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {loading || !stats ? (
        <div className="mt-2 h-6 w-24 animate-pulse rounded bg-muted" />
      ) : (
        <>
          <p className="mt-1 text-xl font-bold text-foreground">
            {formatNumber(stats.totalTokens)}{" "}
            <span className="text-xs font-normal text-muted-foreground">token</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.callCount} lượt gọi
            {stats.errorCount > 0 ? `, ${stats.errorCount} lỗi` : ""}
          </p>
        </>
      )}
    </div>
  );
}

export default function AdminAiUsagePage() {
  const [summary, setSummary] = useState<AiUsageSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<AiUsageGroupBy>("day");
  const [seriesByProvider, setSeriesByProvider] = useState<AiUsageSeriesByProviderPoint[]>([]);
  const [isSeriesLoading, setIsSeriesLoading] = useState(true);

  const loadSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const data = await getAiUsageSummary();
      setSummary(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tải thống kê sử dụng AI");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const loadSeriesByProvider = async (nextGroupBy: AiUsageGroupBy) => {
    setIsSeriesLoading(true);
    try {
      const data = await getAiUsageSeriesByProvider({ groupBy: nextGroupBy });
      setSeriesByProvider(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tải biểu đồ sử dụng AI theo model");
    } finally {
      setIsSeriesLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadSeriesByProvider(groupBy);
  }, [groupBy]);

  const { chartData, providerNames, providerVendorByName } = useMemo(() => {
    const namesInOrder: string[] = [];
    const namesSeen = new Set<string>();
    const vendorByName = new Map<string, string>();
    const periodMap = new Map<string, Record<string, number | string>>();

    for (const row of seriesByProvider) {
      if (!namesSeen.has(row.providerName)) {
        namesSeen.add(row.providerName);
        namesInOrder.push(row.providerName);
        vendorByName.set(row.providerName, row.vendor);
      }
      if (!periodMap.has(row.period)) {
        periodMap.set(row.period, { period: row.period });
      }
      const entry = periodMap.get(row.period)!;
      entry[row.providerName] = (Number(entry[row.providerName]) || 0) + row.totalTokens;
    }

    const data = Array.from(periodMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, values]) => ({
        ...values,
        label: formatPeriodLabel(period, groupBy),
      }));

    return { chartData: data, providerNames: namesInOrder, providerVendorByName: vendorByName };
  }, [seriesByProvider, groupBy]);

  const maxFeatureTokens = Math.max(
    1,
    ...(summary?.byFeature.map((item) => item.totalTokens) ?? [1]),
  );

  const totalProviderTokens = Math.max(
    1,
    (summary?.byProvider ?? []).reduce((sum, item) => sum + item.totalTokens, 0),
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <BsRobot className="h-6 w-6 text-indigo-600" />
          Thống kê sử dụng AI
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi lượng token hệ thống đã dùng theo thời gian và theo từng AI Provider.
        </p>
      </div>

      <AiSectionTabs />

      <Card className="border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h3 className="text-lg font-bold text-foreground">Lượng token theo thời gian</h3>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            {GROUP_BY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setGroupBy(option.value)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  groupBy === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Hôm nay" stats={summary?.today} loading={isSummaryLoading} />
          <StatCard label="Tuần này" stats={summary?.thisWeek} loading={isSummaryLoading} />
          <StatCard label="Tháng này" stats={summary?.thisMonth} loading={isSummaryLoading} />
        </div>

        <div className="mb-6 h-72 w-full">
          {isSeriesLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Chưa có dữ liệu sử dụng trong khoảng thời gian này.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {providerNames.map((name) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={getColorForProvider(name, providerVendorByName.get(name))}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <p className="mb-6 -mt-4 text-xs text-muted-foreground">
          Mỗi màu/đường tương ứng với 1 AI Provider — xem chi tiết lượng token của từng model bên dưới.
        </p>

        {summary && summary.byProvider.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Phân bổ theo AI Model (tháng này)
            </h4>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <div className="h-56 w-full sm:w-56 sm:shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.byProvider}
                      dataKey="totalTokens"
                      nameKey="providerName"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {summary.byProvider.map((item) => (
                        <Cell
                          key={`${item.providerId ?? "deleted"}-${item.vendor}-${item.model}`}
                          fill={getColorForProvider(item.providerName, item.vendor)}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-2">
                {summary.byProvider.map((item) => (
                  <div
                    key={`${item.providerId ?? "deleted"}-${item.vendor}-${item.model}`}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: getColorForProvider(item.providerName, item.vendor) }}
                    />
                    <span
                      className="flex-1 truncate text-xs text-muted-foreground"
                      title={`${item.providerName} (${item.model})`}
                    >
                      {item.providerName}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-foreground">
                      {formatNumber(item.totalTokens)}
                      <span className="ml-1 text-muted-foreground">
                        ({((item.totalTokens / totalProviderTokens) * 100).toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {summary && summary.byFeature.length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Phân bổ theo tính năng (tháng này)
            </h4>
            <div className="space-y-2">
              {summary.byFeature.map((item) => (
                <div key={item.feature} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs text-muted-foreground">
                    {FEATURE_LABEL[item.feature]}
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(item.totalTokens / maxFeatureTokens) * 100}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs font-medium text-foreground">
                    {formatNumber(item.totalTokens)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
