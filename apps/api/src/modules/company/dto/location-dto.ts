import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class LocationDto {
  @IsNotEmpty({ message: 'Mã tỉnh/thành phố không được để trống' })
  @IsString({ message: 'Mã tỉnh/thành phố phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  provinceCode!: string;

  @IsNotEmpty({ message: 'Mã phường/xã không được để trống' })
  @IsString({ message: 'Mã phường/xã phải là chuỗi' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  wardCode!: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ chi tiết phải là chuỗi' })
  @MaxLength(255, { message: 'Địa chỉ chi tiết không được vượt quá 255 ký tự' })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  address?: string;
}
