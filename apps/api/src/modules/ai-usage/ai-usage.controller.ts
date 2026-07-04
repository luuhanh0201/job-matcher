import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/Guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enum/index.enum';
import { AiUsageLogsService } from './ai-usage-logs.service';
import { GetUsageSeriesDto } from './dto/get-usage-series.dto';

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
      : this.getPeriodStart(query.groupBy, to);
    return { from, to };
  }

  // Mặc định thống kê trong chu kỳ hiện tại: hôm nay / tuần này (từ thứ 2) / tháng này
  private getPeriodStart(groupBy: 'day' | 'week' | 'month', to: Date): Date {
    if (groupBy === 'day') {
      return new Date(to.getFullYear(), to.getMonth(), to.getDate());
    }
    if (groupBy === 'week') {
      const diffToMonday = (to.getDay() + 6) % 7;
      return new Date(
        to.getFullYear(),
        to.getMonth(),
        to.getDate() - diffToMonday,
      );
    }
    return new Date(to.getFullYear(), to.getMonth(), 1);
  }
}
