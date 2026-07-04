import { CompanyStatus } from '@/modules/company/entity/company.entity';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryAdminCompaniesDto {
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  keyword?: string;

  @IsOptional()
  @IsEnum(CompanyStatus, { message: 'Trạng thái không hợp lệ' })
  status?: CompanyStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang phải là số nguyên' })
  @Min(1, { message: 'Trang tối thiểu là 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng mỗi trang phải là số nguyên' })
  @Min(1, { message: 'Số lượng mỗi trang tối thiểu là 1' })
  @Max(100, { message: 'Số lượng mỗi trang tối đa là 100' })
  limit?: number = 20;
}
