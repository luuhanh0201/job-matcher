import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CompanySize } from '../entity/company.entity';
import { LocationDto } from './location-dto';
import { plainToInstance, Transform, Type } from 'class-transformer';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Tên công ty không được để trống' })
  name!: string;

  @IsOptional()
  shortName?: string;

  @IsOptional()
  logoUrl?: string;

  @IsNotEmpty({ message: 'Vui lòng chọn quy mô nhân sự' })
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
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return plainToInstance(LocationDto, parsed);
      } catch {
        return value;
      }
    }

    return plainToInstance(LocationDto, value);
  })
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
