import { IsEnum, IsOptional } from 'class-validator';
import { JobPostStatus } from '@/common/enum/Job.enum';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class QueryRecruiterJobsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(JobPostStatus, { message: 'Trạng thái không hợp lệ' })
  status?: JobPostStatus;
}
