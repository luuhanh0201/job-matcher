import { PartialType } from '@nestjs/mapped-types';
import { CreateUploadCloudinaryDto } from './create-upload-cloudinary.dto';

export class UpdateUploadCloudinaryDto extends PartialType(
  CreateUploadCloudinaryDto,
) {}
