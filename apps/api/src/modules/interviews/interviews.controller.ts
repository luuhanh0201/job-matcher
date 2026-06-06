import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/Guards/jwt-auth.guard';
import { User } from '@/modules/user/entities/user.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { InterviewResponseDto } from './dto/interview-response.dto';
import { RespondInterviewDto } from './dto/respond-interview.dto';
import { InterviewsService } from './interviews.service';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post('applications/:applicationId')
  async createInterview(
    @Request() req: Request & { user: User },
    @Param('applicationId') applicationId: string,
    @Body() createInterviewDto: CreateInterviewDto,
  ): Promise<InterviewResponseDto> {
    return this.interviewsService.createInterview(
      applicationId,
      req.user,
      createInterviewDto,
    );
  }

  @Get('recruiter')
  async findRecruiterInterviews(
    @Request() req: Request & { user: User },
  ): Promise<InterviewResponseDto[]> {
    return this.interviewsService.findRecruiterInterviews(req.user);
  }

  @Get('me')
  async findMyInterviews(
    @Request() req: Request & { user: User },
  ): Promise<InterviewResponseDto[]> {
    return this.interviewsService.findMyInterviews(req.user);
  }

  @Patch(':id/respond')
  async respondInterview(
    @Request() req: Request & { user: User },
    @Param('id') id: string,
    @Body() respondInterviewDto: RespondInterviewDto,
  ): Promise<InterviewResponseDto> {
    return this.interviewsService.respondInterview(
      id,
      req.user,
      respondInterviewDto,
    );
  }
}
