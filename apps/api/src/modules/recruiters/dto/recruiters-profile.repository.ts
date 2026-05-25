import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRecruiterProfileDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  contactEmail?: string;
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  contactPhone!: string;
}
