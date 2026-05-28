import { IsNotEmpty, IsOptional } from 'class-validator';

export class LocationDto {
  @IsNotEmpty({ message: 'Mã tỉnh/thành phố không được để trống' })
  provinceCode!: string;
  @IsNotEmpty({ message: 'Mã phường/xã không được để trống' })
  wardCode!: string;
  @IsOptional()
  address?: string;
}
