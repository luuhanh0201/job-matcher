import { MatchPassword } from '@/common/validator/match-password.validator';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu là bắt buộc' })
  @Validate(MatchPassword, { message: 'Mật khẩu xác nhận không khớp' })
  confirmPassword!: string;

  @IsNotEmpty({ message: 'Họ và tên là bắt buộc' })
  @IsString({ message: 'Họ và tên phải là một chuỗi' })
  fullName!: string;

  @IsOptional()
  @IsString({ message: 'Google ID phải là một chuỗi' })
  googleId?: string;

  @IsOptional()
  @IsString({ message: 'Facebook ID phải là một chuỗi' })
  facebookId?: string;

  @IsOptional()
  @IsString({ message: 'Vai trò phải là một chuỗi' })
  provider?: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái xác minh phải là một giá trị boolean' })
  isVerified?: boolean;

  @IsOptional()
  @IsString({ message: 'Mã xác minh phải là một chuỗi' })
  verifyToken?: string;
}
