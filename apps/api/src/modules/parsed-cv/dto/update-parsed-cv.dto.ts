import { PartialType } from '@nestjs/mapped-types';
import { CreateParsedCvDto } from './create-parsed-cv.dto';

export class UpdateParsedCvDto extends PartialType(CreateParsedCvDto) {}
