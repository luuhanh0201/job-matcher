import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiProviderVendor } from '@/modules/ai-providers/entities/ai-provider.entity';
import {
  AiUsageLogEntity,
  AiUsageFeature,
} from './entities/ai-usage-log.entity';

export interface RecordUsageInput {
  providerId: string | null;
  vendor: AiProviderVendor;
  model: string;
  feature: AiUsageFeature;
  usage: { inputTokens: number; outputTokens: number };
  success: boolean;
}

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
  vendor: AiProviderVendor;
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
  vendor: AiProviderVendor;
  model: string;
  totalTokens: number;
  callCount: number;
}

type RawStatsRow = {
  inputTokens: string | null;
  outputTokens: string | null;
  totalTokens: string | null;
  callCount: string | null;
  errorCount: string | null;
};

// Chu kỳ hiển thị → đơn vị bucket: xem theo ngày = từng giờ,
// theo tuần/tháng = từng ngày trong tuần/tháng đó.
const TRUNC_UNIT: Record<'day' | 'week' | 'month', 'hour' | 'day'> = {
  day: 'hour',
  week: 'day',
  month: 'day',
};

// created_at là timestamptz; phải cắt bucket theo giờ Việt Nam thay vì theo
// TimeZone của session DB (UTC), nếu không mốc 0h/đầu ngày sẽ lệch 7 tiếng.
const DISPLAY_TIMEZONE = 'Asia/Ho_Chi_Minh';

function periodBucketSql(unit: 'hour' | 'day'): string {
  // timestamptz → giờ VN (naive) → cắt bucket → trả về lại timestamptz (instant chuẩn).
  return `DATE_TRUNC('${unit}', log.created_at AT TIME ZONE '${DISPLAY_TIMEZONE}') AT TIME ZONE '${DISPLAY_TIMEZONE}'`;
}

function buildProviderName(
  providerName: string | null,
  vendor: AiProviderVendor,
  model: string,
): string {
  return providerName ?? `${vendor} / ${model} (đã xoá)`;
}

@Injectable()
export class AiUsageLogsService {
  private readonly logger = new Logger(AiUsageLogsService.name);

  constructor(
    @InjectRepository(AiUsageLogEntity)
    private readonly usageLogRepository: Repository<AiUsageLogEntity>,
  ) {}

  async record(input: RecordUsageInput): Promise<void> {
    try {
      const log = this.usageLogRepository.create({
        providerId: input.providerId ?? null,
        vendor: input.vendor,
        model: input.model,
        feature: input.feature,
        inputTokens: input.usage.inputTokens,
        outputTokens: input.usage.outputTokens,
        totalTokens: input.usage.inputTokens + input.usage.outputTokens,
        success: input.success,
      });
      await this.usageLogRepository.save(log);
    } catch (error) {
      this.logger.error('Không thể ghi log usage AI', error);
    }
  }

  async getSummary(): Promise<AiUsageSummary> {
    const [today, thisWeek, thisMonth, byFeature, byProvider] =
      await Promise.all([
        this.getStatsSince(this.getPeriodStart('day')),
        this.getStatsSince(this.getPeriodStart('week')),
        this.getStatsSince(this.getPeriodStart('month')),
        this.getFeatureBreakdown(this.getPeriodStart('month')),
        this.getProviderBreakdown(this.getPeriodStart('month')),
      ]);

    return { today, thisWeek, thisMonth, byFeature, byProvider };
  }

  async getSeries(
    groupBy: 'day' | 'week' | 'month',
    from: Date,
    to: Date,
  ): Promise<AiUsageSeriesPoint[]> {
    const rows = await this.usageLogRepository
      .createQueryBuilder('log')
      .select(periodBucketSql(TRUNC_UNIT[groupBy]), 'period')
      .addSelect('COALESCE(SUM(log.inputTokens), 0)', 'inputTokens')
      .addSelect('COALESCE(SUM(log.outputTokens), 0)', 'outputTokens')
      .addSelect('COALESCE(SUM(log.totalTokens), 0)', 'totalTokens')
      .addSelect('COUNT(*)', 'callCount')
      // Truyền chuỗi ISO (UTC) thay vì Date object: driver pg serialize Date theo
      // giờ địa phương kèm offset, trong khi cột created_at là "timestamp without
      // time zone" (Postgres bỏ qua offset) — gây lệch giờ khi so sánh khoảng thời gian.
      .where('log.createdAt >= :from', { from: from.toISOString() })
      .andWhere('log.createdAt <= :to', { to: to.toISOString() })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany<{
        period: Date;
        inputTokens: string;
        outputTokens: string;
        totalTokens: string;
        callCount: string;
      }>();

    return rows.map((row) => ({
      period: new Date(row.period).toISOString(),
      inputTokens: Number(row.inputTokens),
      outputTokens: Number(row.outputTokens),
      totalTokens: Number(row.totalTokens),
      callCount: Number(row.callCount),
    }));
  }

  async getSeriesByProvider(
    groupBy: 'day' | 'week' | 'month',
    from: Date,
    to: Date,
  ): Promise<AiUsageSeriesByProviderPoint[]> {
    const rows = await this.usageLogRepository
      .createQueryBuilder('log')
      // innerJoin: chỉ tính token của các AI Provider hiện đang tồn tại,
      // provider đã bị xoá sẽ không xuất hiện trong biểu đồ/phân bổ.
      .innerJoin('log.provider', 'provider')
      .select(periodBucketSql(TRUNC_UNIT[groupBy]), 'period')
      .addSelect('log.providerId', 'providerId')
      .addSelect('provider.name', 'providerName')
      .addSelect('log.vendor', 'vendor')
      .addSelect('log.model', 'model')
      .addSelect('COALESCE(SUM(log.totalTokens), 0)', 'totalTokens')
      .addSelect('COUNT(*)', 'callCount')
      .where('log.createdAt >= :from', { from: from.toISOString() })
      .andWhere('log.createdAt <= :to', { to: to.toISOString() })
      .groupBy('period')
      .addGroupBy('log.providerId')
      .addGroupBy('provider.name')
      .addGroupBy('log.vendor')
      .addGroupBy('log.model')
      .orderBy('period', 'ASC')
      .getRawMany<{
        period: Date;
        providerId: string | null;
        providerName: string | null;
        vendor: AiProviderVendor;
        model: string;
        totalTokens: string;
        callCount: string;
      }>();

    return rows.map((row) => ({
      period: new Date(row.period).toISOString(),
      providerId: row.providerId,
      providerName: buildProviderName(row.providerName, row.vendor, row.model),
      vendor: row.vendor,
      model: row.model,
      totalTokens: Number(row.totalTokens),
      callCount: Number(row.callCount),
    }));
  }

  private getPeriodStart(period: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    if (period === 'day') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    if (period === 'week') {
      const dayOfWeek = now.getDay();
      const diffToMonday = (dayOfWeek + 6) % 7;
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - diffToMonday,
      );
    }
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private async getStatsSince(start: Date): Promise<AiUsagePeriodStats> {
    const result = await this.usageLogRepository
      .createQueryBuilder('log')
      .select('COALESCE(SUM(log.inputTokens), 0)', 'inputTokens')
      .addSelect('COALESCE(SUM(log.outputTokens), 0)', 'outputTokens')
      .addSelect('COALESCE(SUM(log.totalTokens), 0)', 'totalTokens')
      .addSelect('COUNT(*)', 'callCount')
      .addSelect('COUNT(*) FILTER (WHERE log.success = false)', 'errorCount')
      .where('log.createdAt >= :start', { start: start.toISOString() })
      .getRawOne<RawStatsRow>();

    return {
      inputTokens: Number(result?.inputTokens ?? 0),
      outputTokens: Number(result?.outputTokens ?? 0),
      totalTokens: Number(result?.totalTokens ?? 0),
      callCount: Number(result?.callCount ?? 0),
      errorCount: Number(result?.errorCount ?? 0),
    };
  }

  private async getFeatureBreakdown(
    start: Date,
  ): Promise<AiUsageFeatureBreakdown[]> {
    const rows = await this.usageLogRepository
      .createQueryBuilder('log')
      .select('log.feature', 'feature')
      .addSelect('COALESCE(SUM(log.totalTokens), 0)', 'totalTokens')
      .addSelect('COUNT(*)', 'callCount')
      .where('log.createdAt >= :start', { start: start.toISOString() })
      .groupBy('log.feature')
      .orderBy('"totalTokens"', 'DESC')
      .getRawMany<{
        feature: AiUsageFeature;
        totalTokens: string;
        callCount: string;
      }>();

    return rows.map((row) => ({
      feature: row.feature,
      totalTokens: Number(row.totalTokens),
      callCount: Number(row.callCount),
    }));
  }

  private async getProviderBreakdown(
    start: Date,
  ): Promise<AiUsageProviderBreakdown[]> {
    const rows = await this.usageLogRepository
      .createQueryBuilder('log')
      // innerJoin: chỉ tính token của các AI Provider hiện đang tồn tại,
      // provider đã bị xoá sẽ không xuất hiện trong biểu đồ/phân bổ.
      .innerJoin('log.provider', 'provider')
      .select('log.providerId', 'providerId')
      .addSelect('provider.name', 'providerName')
      .addSelect('log.vendor', 'vendor')
      .addSelect('log.model', 'model')
      .addSelect('COALESCE(SUM(log.totalTokens), 0)', 'totalTokens')
      .addSelect('COUNT(*)', 'callCount')
      .where('log.createdAt >= :start', { start: start.toISOString() })
      .groupBy('log.providerId')
      .addGroupBy('provider.name')
      .addGroupBy('log.vendor')
      .addGroupBy('log.model')
      .orderBy('"totalTokens"', 'DESC')
      .getRawMany<{
        providerId: string | null;
        providerName: string | null;
        vendor: AiProviderVendor;
        model: string;
        totalTokens: string;
        callCount: string;
      }>();

    return rows.map((row) => ({
      providerId: row.providerId,
      providerName: buildProviderName(row.providerName, row.vendor, row.model),
      vendor: row.vendor,
      model: row.model,
      totalTokens: Number(row.totalTokens),
      callCount: Number(row.callCount),
    }));
  }
}
