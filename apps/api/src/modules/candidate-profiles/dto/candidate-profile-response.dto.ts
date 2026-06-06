import { UserRole } from '@/common/enum/index.enum';

export class CandidateProfileResponseDto {
  user!: {
    id: string;
    email: string;
    fullName: string;
    phone?: string | null;
    avatar?: string | null;
    role: UserRole;
  };
  profile!: {
    id?: string;
    currentTitle?: string | null;
    totalExperienceYears?: string | null;
    summary?: string | null;
    skills?: string[] | null;
    education?: string[] | null;
    workExperience?: string[] | null;
    certifications?: string[] | null;
    languages?: string[] | null;
    portfolioUrl?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  } | null;
}
