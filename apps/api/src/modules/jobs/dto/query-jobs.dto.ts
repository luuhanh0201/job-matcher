import { JobType, SeniorityLevel, WorkMode } from '@/common/enum/Job.enum';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum JobSortOption {
  NEWEST = 'newest',
  SALARY_DESC = 'salary_desc',
}

// Query string có thể gửi dạng lặp (?skills=a&skills=b) hoặc gộp (?skills=a,b)
const toStringArray = ({ value }: { value: unknown }): string[] | undefined => {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
};

export class QueryJobsDto {
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  keyword?: string;

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString({ message: 'Mã tỉnh/thành không hợp lệ' })
  provinceCode?: string;

  @IsOptional()
  @Transform(toStringArray)
  @IsArray({ message: 'Kỹ năng phải là danh sách' })
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsEnum(JobType, { message: 'Loại công việc không hợp lệ' })
  jobType?: JobType;

  @IsOptional()
  @IsEnum(WorkMode, { message: 'Hình thức làm việc không hợp lệ' })
  workMode?: WorkMode;

  @IsOptional()
  @IsEnum(SeniorityLevel, { message: 'Cấp độ kinh nghiệm không hợp lệ' })
  seniorityLevel?: SeniorityLevel;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Mức lương tối thiểu phải là số' })
  @Min(0, { message: 'Mức lương tối thiểu không được âm' })
  salaryMin?: number;

  @IsOptional()
  @IsEnum(JobSortOption, { message: 'Kiểu sắp xếp không hợp lệ' })
  sort?: JobSortOption = JobSortOption.NEWEST;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang phải là số nguyên' })
  @Min(1, { message: 'Trang tối thiểu là 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng mỗi trang phải là số nguyên' })
  @Min(1, { message: 'Số lượng mỗi trang tối thiểu là 1' })
  @Max(50, { message: 'Số lượng mỗi trang tối đa là 50' })
  limit?: number = 12;
}
