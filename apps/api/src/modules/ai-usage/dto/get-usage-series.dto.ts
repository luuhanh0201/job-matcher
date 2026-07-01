import { IsIn, IsISO8601, IsOptional } from 'class-validator';

export class GetUsageSeriesDto {
  @IsIn(['day', 'week', 'month'], {
    message: 'groupBy phải là một trong: day, week, month',
  })
  groupBy!: 'day' | 'week' | 'month';

  @IsOptional()
  @IsISO8601({}, { message: 'from phải là ngày ISO8601 hợp lệ' })
  from?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'to phải là ngày ISO8601 hợp lệ' })
  to?: string;
}
