import type { UserRole } from "@/types/user-role.type";

export type CandidateProfilePayload = {
  fullName?: string;
  phone?: string;
  avatar?: string;
  currentTitle?: string;
  totalExperienceYears?: string;
  summary?: string;
  skills?: string[];
  education?: string[];
  workExperience?: string[];
  certifications?: string[];
  languages?: string[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
};

export type CandidateProfile = {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string | null;
    avatar?: string | null;
    role: UserRole;
  };
  profile: {
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
    createdAt?: string;
    updatedAt?: string;
  } | null;
};
