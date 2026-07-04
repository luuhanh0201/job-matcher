import { IsEnum, IsOptional } from 'class-validator';
import { InterviewStatus } from '@/common/enum/Interview.enum';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { InterviewResponseDto } from './interview-response.dto';

export class QueryInterviewsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(InterviewStatus, { message: 'Trạng thái không hợp lệ' })
  status?: InterviewStatus;
}

export class PaginatedInterviewsResponseDto {
  items!: InterviewResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
