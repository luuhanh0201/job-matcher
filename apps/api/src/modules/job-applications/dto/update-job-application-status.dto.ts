import { JobApplicationStatus } from '@/common/enum/JobApplication.enum';
import { IsEnum } from 'class-validator';

export class UpdateJobApplicationStatusDto {
  @IsEnum(JobApplicationStatus)
  status!: JobApplicationStatus;
}
