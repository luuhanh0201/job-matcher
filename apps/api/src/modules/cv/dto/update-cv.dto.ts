import { PartialType } from '@nestjs/mapped-types';
import { ExtractedCvDto } from './extracted-cv.dto';

export class UpdateCvDto extends PartialType(ExtractedCvDto) { }
