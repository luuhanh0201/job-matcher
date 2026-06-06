import { InterviewStatus } from '@/common/enum/Interview.enum';
import { IsIn } from 'class-validator';

export class RespondInterviewDto {
  @IsIn([InterviewStatus.ACCEPTED, InterviewStatus.DECLINED])
  status!: InterviewStatus.ACCEPTED | InterviewStatus.DECLINED;
}
