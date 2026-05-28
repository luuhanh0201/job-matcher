import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRecruiterProfileDto {
  @IsOptional()
  @IsString({ message: 'Họ và tên không hợp lệ' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  contactEmail?: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại không hợp lệ' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  contactPhone?: string;
}
