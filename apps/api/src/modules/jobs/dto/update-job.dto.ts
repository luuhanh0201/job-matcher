import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from '@/modules/jobs/dto/create-job.dto';

export class UpdateJobDto extends PartialType(CreateJobDto) {}
