import { MatchPassword } from '@/common/validator/match-password.validator';
import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  password!: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu là bắt buộc' })
  @Validate(MatchPassword, { message: 'Mật khẩu xác nhận không khớp' })
  confirmPassword!: string;

  @IsNotEmpty({ message: 'Họ và tên là bắt buộc' })
  fullName!: string;

  @IsString({ message: 'Google ID phải là một chuỗi' })
  googleId?: string;

  @IsString({ message: 'Facebook ID phải là một chuỗi' })
  facebookId?: string;

  @IsString({ message: 'Vai trò phải là một chuỗi' })
  provider?: string;
}
