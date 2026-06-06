import { InterviewStatus } from '@/common/enum/Interview.enum';
import { JobApplicationStatus } from '@/common/enum/JobApplication.enum';

export class InterviewResponseDto {
  id!: string;
  applicationId!: string;
  applicationStatus!: JobApplicationStatus;
  candidate!: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  recruiter!: {
    id: string;
    fullName: string;
    email: string;
  };
  job!: {
    id: string;
    title: string;
    company?: {
      id: string;
      name: string;
      logoUrl?: string;
    } | null;
  };
  scheduledAt!: Date;
  durationMinutes!: number;
  meetingUrl?: string | null;
  location?: string | null;
  note?: string | null;
  status!: InterviewStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
