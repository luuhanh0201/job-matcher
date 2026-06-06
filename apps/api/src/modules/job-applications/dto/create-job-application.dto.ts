import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateJobApplicationDto {
  @IsOptional()
  @IsUUID()
  cvId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverLetter?: string;
}
