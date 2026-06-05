import { JobPostStatus } from '@/common/enum/Job.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateJobStatusDto {
  @IsNotEmpty({ message: 'Vui lòng chọn trạng thái tin tuyển dụng' })
  @IsEnum(JobPostStatus, { message: 'Trạng thái tin tuyển dụng không hợp lệ' })
  status!: JobPostStatus;
}
