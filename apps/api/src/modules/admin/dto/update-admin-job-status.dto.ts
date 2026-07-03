import { JobPostStatus } from '@/common/enum/Job.enum';
import { IsEnum, IsIn, IsNotEmpty } from 'class-validator';

export class UpdateAdminJobStatusDto {
  @IsNotEmpty({ message: 'Vui lòng chọn trạng thái' })
  @IsEnum(JobPostStatus, { message: 'Trạng thái không hợp lệ' })
  @IsIn([JobPostStatus.OPEN, JobPostStatus.CLOSED, JobPostStatus.BLOCKED], {
    message: 'Admin chỉ có thể mở, đóng hoặc khóa tin tuyển dụng',
  })
  status!: JobPostStatus;
}
