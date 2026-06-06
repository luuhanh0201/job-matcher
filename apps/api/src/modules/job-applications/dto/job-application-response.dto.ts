import { JobApplicationStatus } from '@/common/enum/JobApplication.enum';
import { JobPostStatus } from '@/common/enum/Job.enum';

export class JobApplicationResponseDto {
  id!: string;
  jobId!: string;
  job!: {
    id: string;
    title: string;
    status: JobPostStatus;
    company?: {
      id: string;
      name: string;
      logoUrl?: string;
    } | null;
  };
  candidate!: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  cv?: {
    id: string;
    publicId: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
  } | null;
  coverLetter?: string | null;
  status!: JobApplicationStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
