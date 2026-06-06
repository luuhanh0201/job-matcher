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
import { JwtAuthGuard } from '../auth/Guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { JobPostResponseDto } from './dto/job-response.dto';
import { JobsService } from './jobs.service';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(
    @Request() req: Request & { user: User },
    @Body() createJobDto: CreateJobDto,
  ): Promise<JobPostResponseDto> {
    return this.jobsService.createPost(createJobDto, req.user);
  }

  @Get()
  async findAll(): Promise<JobPostResponseDto[]> {
    return this.jobsService.findPublicOpenJobs();
  }

  @UseGuards(JwtAuthGuard)
  @Get('recruiter/my')
  async findRecruiterJobs(
    @Request() req: Request & { user: User },
  ): Promise<JobPostResponseDto[]> {
    return this.jobsService.findRecruiterJobs(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recruiter/:id')
  async findRecruiterJobById(
    @Request() req: Request & { user: User },
    @Param('id') id: string,
  ): Promise<JobPostResponseDto> {
    return this.jobsService.findRecruiterJobById(id, req.user);
  }

  @Get(':id')
  async findPublicJobById(
    @Param('id') id: string,
  ): Promise<JobPostResponseDto> {
    return this.jobsService.findPublicOpenJobById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Request() req: Request & { user: User },
    @Param('id') id: string,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<JobPostResponseDto> {
    return this.jobsService.updateStatus(
      id,
      updateJobStatusDto.status,
      req.user,
    );
  }
}
