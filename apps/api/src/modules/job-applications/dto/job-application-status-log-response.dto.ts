import { JobApplicationStatus } from '@/common/enum/JobApplication.enum';
import { UserRole } from '@/common/enum/index.enum';

export class JobApplicationStatusLogResponseDto {
  id!: string;
  applicationId!: string;
  fromStatus!: JobApplicationStatus | null;
  toStatus!: JobApplicationStatus;
  content!: string;
  changedBy!: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  } | null;
  createdAt!: Date;
}
