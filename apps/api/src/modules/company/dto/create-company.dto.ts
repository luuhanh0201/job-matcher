import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CompanySize } from '../entity/company.entity';
import { LocationDto } from './location-dto';
import { Type } from 'class-transformer';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Trường này không được để trống' })
  name!: string;

  @IsOptional()
  shortName?: string;

  @IsOptional()
  logoUrl?: string;

  @IsNotEmpty({ message: 'Trường này không được để trống' })
  @IsEnum(CompanySize, { message: 'Kích thước công ty không hợp lệ' })
  companySize!: CompanySize;

  @IsOptional()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  taxCode?: string;

  @IsOptional()
  companyType?: string;

  @IsOptional()
  website?: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @IsOptional()
  linkedinUrl?: string;

  @IsOptional()
  facebookUrl?: string;

  @IsOptional()
  description?: string;
}
