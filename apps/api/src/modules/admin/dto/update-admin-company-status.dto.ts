import { CompanyStatus } from '@/modules/company/entity/company.entity';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateAdminCompanyStatusDto {
  @IsNotEmpty({ message: 'Vui lòng chọn trạng thái' })
  @IsEnum(CompanyStatus, { message: 'Trạng thái không hợp lệ' })
  @IsIn(
    [CompanyStatus.ACTIVE, CompanyStatus.INACTIVE, CompanyStatus.REJECTED],
    {
      message:
        'Admin chỉ có thể phê duyệt, từ chối hoặc ngừng hoạt động công ty',
    },
  )
  status!: CompanyStatus;

  @IsOptional()
  @IsString({ message: 'Lý do phải là chuỗi' })
  @MaxLength(500, { message: 'Lý do tối đa 500 ký tự' })
  reason?: string;
}
