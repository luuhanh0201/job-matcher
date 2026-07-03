import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/Guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  JobPostResponseDto,
  PaginatedJobsResponseDto,
} from './dto/job-response.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { JobsService } from './jobs.service';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enum/index.enum';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @Post()
  async createPost(
    @Request() req: Request & { user: User },
    @Body() createJobDto: CreateJobDto,
  ): Promise<JobPostResponseDto> {
    return this.jobsService.createPost(createJobDto, req.user);
  }

  @Get()
  async findAll(
    @Query() query: QueryJobsDto,
  ): Promise<PaginatedJobsResponseDto> {
    return this.jobsService.findPublicOpenJobs(query);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
  @Patch(':id')
  async updateJobContent(
    @Request() req: Request & { user: User },
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<JobPostResponseDto> {
    return this.jobsService.updateJobContent(id, updateJobDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER)
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
