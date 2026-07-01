import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/Guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enum/index.enum';
import { AiUsageLogsService } from './ai-usage-logs.service';
import { GetUsageSeriesDto } from './dto/get-usage-series.dto';

const DEFAULT_RANGE_DAYS: Record<'day' | 'week' | 'month', number> = {
  day: 30,
  week: 84,
  month: 180,
};

@Controller('admin/ai-usage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AiUsageController {
  constructor(private readonly aiUsageLogsService: AiUsageLogsService) {}

  @Get('summary')
  async getSummary() {
    return this.aiUsageLogsService.getSummary();
  }

  @Get('series')
  async getSeries(@Query() query: GetUsageSeriesDto) {
    const { from, to } = this.resolveRange(query);
    return this.aiUsageLogsService.getSeries(query.groupBy, from, to);
  }

  @Get('series-by-provider')
  async getSeriesByProvider(@Query() query: GetUsageSeriesDto) {
    const { from, to } = this.resolveRange(query);
    return this.aiUsageLogsService.getSeriesByProvider(query.groupBy, from, to);
  }

  private resolveRange(query: GetUsageSeriesDto): { from: Date; to: Date } {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(
          to.getTime() -
            DEFAULT_RANGE_DAYS[query.groupBy] * 24 * 60 * 60 * 1000,
        );
    return { from, to };
  }
}
