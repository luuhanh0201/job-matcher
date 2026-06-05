import {
  CURRENCY,
  JobPostStatus,
  JobType,
  SalaryType,
  SeniorityLevel,
  WorkMode,
} from '@/common/enum/Job.enum';
import { CompanyEntity } from '@/modules/company/entity/company.entity';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty({ message: 'Tiêu đề công việc không được để trống' })
  @IsString({ message: 'Tiêu đề công việc phải là chuỗi' })
  title!: string;

  @IsNotEmpty({ message: 'Vui lòng chọn công ty' })
  @IsUUID('4', { message: 'Công ty không hợp lệ' })
  companyId!: CompanyEntity['id'];

  @IsNotEmpty({ message: 'Bộ phận không được để trống' })
  @IsString({ message: 'Bộ phận phải là chuỗi' })
  department!: string;

  @IsNotEmpty({ message: 'Vui lòng chọn loại công việc' })
  @IsEnum(JobType, { message: 'Loại công việc không hợp lệ' })
  jobType!: JobType;

  @IsOptional()
  @IsEnum(WorkMode, { message: 'Hình thức làm việc không hợp lệ' })
  workMode?: WorkMode;

  @IsOptional()
  @IsEnum(SeniorityLevel, { message: 'Cấp độ kinh nghiệm không hợp lệ' })
  seniorityLevel?: SeniorityLevel;

  @IsNotEmpty({ message: 'Vui lòng chọn loại lương' })
  @IsEnum(SalaryType, { message: 'Loại lương không hợp lệ' })
  salaryType!: SalaryType;

  @IsOptional()
  @IsEnum(CURRENCY, { message: 'Đơn vị tiền tệ không hợp lệ' })
  currency?: CURRENCY;

  @IsOptional()
  @IsNumber({}, { message: 'Mức lương tối thiểu phải là số' })
  @Min(0, { message: 'Mức lương tối thiểu không được âm' })
  salaryMin?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Mức lương tối đa phải là số' })
  @Min(0, { message: 'Mức lương tối đa không được âm' })
  salaryMax?: number;

  @IsNotEmpty({ message: 'Mô tả công việc không được để trống' })
  @IsString({ message: 'Mô tả công việc phải là chuỗi' })
  description!: string;

  @IsNotEmpty({ message: 'Yêu cầu công việc không được để trống' })
  @IsString({ message: 'Yêu cầu công việc phải là chuỗi' })
  requirements!: string;

  @IsOptional()
  @IsString({ message: 'Trách nhiệm công việc phải là chuỗi' })
  responsibilities?: string;

  @IsOptional()
  @IsString({ message: 'Phúc lợi phải là chuỗi' })
  benefits?: string;

  @IsOptional()
  @IsArray({ message: 'Kỹ năng phải là danh sách' })
  @IsString({ each: true, message: 'Mỗi kỹ năng phải là chuỗi' })
  skills?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'Số lượng tuyển phải là số' })
  @Min(1, { message: 'Số lượng tuyển tối thiểu là 1' })
  quantity?: number;

  @IsOptional()
  @IsEnum(JobPostStatus, { message: 'Trạng thái không hợp lệ' })
  status?: JobPostStatus;

  @IsNotEmpty({ message: 'Vui lòng chọn hạn ứng tuyển' })
  @IsDateString({}, { message: 'Hạn ứng tuyển không hợp lệ' })
  expiredAt!: string;
}
