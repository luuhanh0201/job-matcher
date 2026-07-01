export type AiUsageFeature =
  | "CHAT"
  | "JOB_MATCHING"
  | "CV_EXTRACTION"
  | "CV_ANALYSIS"
  | "CONNECTION_TEST";

export type AiProviderVendorName = "ANTHROPIC" | "OPENAI" | "GEMINI" | "GROQ";

export interface AiUsagePeriodStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  callCount: number;
  errorCount: number;
}

export interface AiUsageFeatureBreakdown {
  feature: AiUsageFeature;
  totalTokens: number;
  callCount: number;
}

export interface AiUsageProviderBreakdown {
  providerId: string | null;
  providerName: string;
  vendor: AiProviderVendorName;
  model: string;
  totalTokens: number;
  callCount: number;
}

export interface AiUsageSummary {
  today: AiUsagePeriodStats;
  thisWeek: AiUsagePeriodStats;
  thisMonth: AiUsagePeriodStats;
  byFeature: AiUsageFeatureBreakdown[];
  byProvider: AiUsageProviderBreakdown[];
}

export interface AiUsageSeriesPoint {
  period: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  callCount: number;
}

export interface AiUsageSeriesByProviderPoint {
  period: string;
  providerId: string | null;
  providerName: string;
  vendor: AiProviderVendorName;
  model: string;
  totalTokens: number;
  callCount: number;
}

export type AiUsageGroupBy = "day" | "week" | "month";

export interface GetAiUsageSeriesParams {
  groupBy: AiUsageGroupBy;
  from?: string;
  to?: string;
}
