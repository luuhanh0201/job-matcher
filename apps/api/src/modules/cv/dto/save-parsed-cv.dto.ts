import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SaveParsedCvDto {
  @IsString()
  @IsNotEmpty()
  cvId!: string;

  @IsString()
  @IsOptional()
  candidateName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  totalExperienceYears?: string;

  @IsString()
  @IsOptional()
  currentTitle?: string;

  @IsString()
  @IsOptional()
  skills?: string;

  @IsString()
  @IsOptional()
  education?: string;

  @IsString()
  @IsOptional()
  workExperience?: string;

  @IsString()
  @IsOptional()
  certifications?: string;

  @IsString()
  @IsOptional()
  languages?: string;
}
