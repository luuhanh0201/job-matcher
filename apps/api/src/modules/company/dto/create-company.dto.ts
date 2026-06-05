import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CompanySize } from '../entity/company.entity';
import { LocationDto } from './location-dto';
import { plainToInstance, Transform, Type } from 'class-transformer';

function trimRequiredString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function trimOptionalString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class CreateCompanyDto {
  @Transform(({ value }: { value: unknown }) => trimRequiredString(value))
  @IsNotEmpty({ message: 'Tên công ty không được để trống' })
  @IsString({ message: 'Tên công ty phải là chuỗi' })
  @Length(2, 160, { message: 'Tên công ty phải từ 2 đến 160 ký tự' })
  name!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsString({ message: 'Tên viết tắt phải là chuỗi' })
  @MaxLength(50, { message: 'Tên viết tắt không được vượt quá 50 ký tự' })
  shortName?: string;

  @IsNotEmpty({ message: 'Vui lòng chọn quy mô nhân sự' })
  @IsEnum(CompanySize, { message: 'Kích thước công ty không hợp lệ' })
  companySize!: CompanySize;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsEmail({}, { message: 'Email công ty không hợp lệ' })
  @MaxLength(120, { message: 'Email công ty không được vượt quá 120 ký tự' })
  email?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @Matches(/^(0|\+84)[0-9]{8,10}$/, {
    message: 'Số điện thoại công ty không hợp lệ',
  })
  phone?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @Matches(/^\d{10}(-\d{3})?$/, {
    message: 'Mã số thuế phải có 10 chữ số hoặc dạng 10 chữ số-3 chữ số',
  })
  taxCode?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsString({ message: 'Lĩnh vực công ty phải là chuỗi' })
  @MaxLength(100, { message: 'Lĩnh vực công ty không được vượt quá 100 ký tự' })
  companyType?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'Website phải là URL hợp lệ và bắt đầu bằng http hoặc https' },
  )
  @MaxLength(255, { message: 'Website không được vượt quá 255 ký tự' })
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
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'LinkedIn phải là URL hợp lệ và bắt đầu bằng http hoặc https' },
  )
  @MaxLength(255, { message: 'LinkedIn không được vượt quá 255 ký tự' })
  linkedinUrl?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'Facebook phải là URL hợp lệ và bắt đầu bằng http hoặc https' },
  )
  @MaxLength(255, { message: 'Facebook không được vượt quá 255 ký tự' })
  facebookUrl?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsString({ message: 'Mô tả công ty phải là chuỗi' })
  @MaxLength(5000, { message: 'Mô tả công ty không được vượt quá 5000 ký tự' })
  description?: string;
}
