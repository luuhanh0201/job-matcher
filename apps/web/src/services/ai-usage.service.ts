import { protectedFetchJson } from "@/services/auth.service";
import type {
  AiUsageSeriesByProviderPoint,
  AiUsageSeriesPoint,
  AiUsageSummary,
  GetAiUsageSeriesParams,
} from "@/types/ai-usage";

export async function getAiUsageSummary() {
  return protectedFetchJson<AiUsageSummary>(
    "/admin/ai-usage/summary",
    { method: "GET" },
    "Không thể tải thống kê sử dụng AI",
  );
}

function buildSeriesQuery(params: GetAiUsageSeriesParams): string {
  const query = new URLSearchParams({ groupBy: params.groupBy });
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  return query.toString();
}

export async function getAiUsageSeries(params: GetAiUsageSeriesParams) {
  return protectedFetchJson<AiUsageSeriesPoint[]>(
    `/admin/ai-usage/series?${buildSeriesQuery(params)}`,
    { method: "GET" },
    "Không thể tải biểu đồ sử dụng AI",
  );
}

export async function getAiUsageSeriesByProvider(
  params: GetAiUsageSeriesParams,
) {
  return protectedFetchJson<AiUsageSeriesByProviderPoint[]>(
    `/admin/ai-usage/series-by-provider?${buildSeriesQuery(params)}`,
    { method: "GET" },
    "Không thể tải biểu đồ sử dụng AI theo model",
  );
}
