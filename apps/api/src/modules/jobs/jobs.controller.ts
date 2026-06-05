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
    return this.jobsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JobPostResponseDto> {
    return this.jobsService.findOne(id);
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
