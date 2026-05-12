import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsEmail,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class ExtractedEducationDto {
    @IsString()
    @IsOptional()
    school?: string;

    @IsString()
    @IsOptional()
    degree?: string;

    @IsString()
    @IsOptional()
    major?: string;

    @IsString()
    @IsOptional()
    time?: string;
}

export class ExtractedWorkExperienceDto {
    @IsString()
    @IsOptional()
    company?: string;

    @IsString()
    @IsOptional()
    position?: string;

    @IsString()
    @IsOptional()
    time?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class ExtractedCvDto {
    @IsString()
    @IsOptional()
    candidateName!: string;

    @IsString()
    @IsOptional()
    currentTitle!: string;

    @Transform(({ value }) =>
        typeof value === 'string' && value.trim().length === 0 ? undefined : value,
    )
    @IsEmail()
    @IsOptional()
    email!: string;

    @IsString()
    @IsOptional()
    phone!: string;

    @IsString()
    @IsOptional()
    totalExperienceYears?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    skills?: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExtractedEducationDto)
    @IsOptional()
    education?: ExtractedEducationDto[];

    @IsArray({ message: 'Kinh nghiệm làm việc phải là một mảng' })
    @ValidateNested({ each: true })
    @Type(() => ExtractedWorkExperienceDto)
    @IsOptional()
    workExperience?: ExtractedWorkExperienceDto[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    certifications?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    languages?: string[];
}