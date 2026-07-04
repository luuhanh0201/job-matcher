import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { JobApplicationStatus } from '@/common/enum/JobApplication.enum';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { JobApplicationResponseDto } from './job-application-response.dto';

export class QueryApplicationsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(JobApplicationStatus, { message: 'Trạng thái không hợp lệ' })
  status?: JobApplicationStatus;

  @IsOptional()
  @IsUUID('4', { message: 'jobId không hợp lệ' })
  jobId?: string;
}

export class PaginatedJobApplicationsResponseDto {
  items!: JobApplicationResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
