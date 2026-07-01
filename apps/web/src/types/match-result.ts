export interface MatchResultJob {
  id: string;
  title: string;
  department: string;
  jobType: string;
  workMode: string;
  salaryType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  seniorityLevel: string;
  skills: string[];
  expiredAt: string | null;
}

export interface MatchResult {
  id: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  titleScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
  matchedAt: string;
  job: MatchResultJob;
}
