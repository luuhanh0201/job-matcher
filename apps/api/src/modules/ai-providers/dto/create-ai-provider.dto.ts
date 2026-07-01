import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AiProviderVendor } from '../entities/ai-provider.entity';

export class CreateAiProviderDto {
  @IsNotEmpty({ message: 'Tên AI Provider không được để trống' })
  @IsString({ message: 'Tên AI Provider phải là chuỗi' })
  @MaxLength(120, { message: 'Tên AI Provider không được vượt quá 120 ký tự' })
  name!: string;

  @IsEnum(AiProviderVendor, { message: 'Nhà cung cấp AI không hợp lệ' })
  vendor!: AiProviderVendor;

  @IsNotEmpty({ message: 'Model không được để trống' })
  @IsString({ message: 'Model phải là chuỗi' })
  @MaxLength(120, { message: 'Model không được vượt quá 120 ký tự' })
  model!: string;

  @IsNotEmpty({ message: 'API key không được để trống' })
  @IsString({ message: 'API key phải là chuỗi' })
  apiKey!: string;

  @IsOptional()
  @IsInt({ message: 'Max tokens phải là số nguyên' })
  @Min(1, { message: 'Max tokens phải lớn hơn 0' })
  @Max(200000, { message: 'Max tokens không được vượt quá 200000' })
  maxTokens?: number;
}
