import { UserStatus } from '@/common/enum/index.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @IsNotEmpty({ message: 'Vui lòng chọn trạng thái' })
  @IsEnum(UserStatus, { message: 'Trạng thái không hợp lệ' })
  status!: UserStatus;
}
