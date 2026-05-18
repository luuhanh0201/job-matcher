import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum RecommendedRoleLevel {
  INTERN = 'Intern',
  FRESHER = 'Fresher',
  JUNIOR = 'Junior',
  MIDDLE = 'Middle',
  SENIOR = 'Senior',
}

export class RecommendedRoleDto {
  @IsString()
  role!: string;

  @IsEnum(RecommendedRoleLevel)
  level!: RecommendedRoleLevel;

  @IsString()
  reason!: string;
}

export class AnalyzerCvResultDto {
  @IsString()
  summary!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  strengths!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  weaknesses!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecommendedRoleDto)
  recommended_roles!: RecommendedRoleDto[];

  @IsNumber()
  @Min(1)
  @Max(10)
  overall_score!: number;
}
