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
import { JwtAuthGuard } from '@/modules/auth/Guards/jwt-auth.guard';
import { User } from '@/modules/user/entities/user.entity';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { JobApplicationStatusLogResponseDto } from './dto/job-application-status-log-response.dto';
import {
  PaginatedJobApplicationsResponseDto,
  QueryApplicationsDto,
} from './dto/query-applications.dto';
import { JobApplicationsService } from './job-applications.service';
import { UpdateJobApplicationStatusDto } from './dto/update-job-application-status.dto';

@Controller('jobs')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/apply')
  async applyToJob(
    @Request() req: Request & { user: User },
    @Param('id') id: string,
    @Body() createJobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplicationResponseDto> {
    return this.jobApplicationsService.applyToJob(
      id,
      req.user,
      createJobApplicationDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('applications/recruiter')
  async findRecruiterApplications(
    @Request() req: Request & { user: User },
    @Query() query: QueryApplicationsDto,
  ): Promise<PaginatedJobApplicationsResponseDto> {
    return this.jobApplicationsService.findRecruiterApplications(
      req.user,
      query,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('applications/me')
  async findMyApplications(
    @Request() req: Request & { user: User },
    @Query() query: QueryApplicationsDto,
  ): Promise<PaginatedJobApplicationsResponseDto> {
    return this.jobApplicationsService.findMyApplications(req.user, query);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('applications/:applicationId/status')
  async updateStatus(
    @Request() req: Request & { user: User },
    @Param('applicationId') applicationId: string,
    @Body() updateJobApplicationStatusDto: UpdateJobApplicationStatusDto,
  ): Promise<JobApplicationResponseDto> {
    return this.jobApplicationsService.updateStatus(
      applicationId,
      updateJobApplicationStatusDto.status,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('applications/:applicationId/status-logs')
  async findStatusLogs(
    @Request() req: Request & { user: User },
    @Param('applicationId') applicationId: string,
  ): Promise<JobApplicationStatusLogResponseDto[]> {
    return this.jobApplicationsService.findStatusLogs(applicationId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/applications')
  async findByJob(
    @Request() req: Request & { user: User },
    @Param('id') id: string,
    @Query() query: QueryApplicationsDto,
  ): Promise<PaginatedJobApplicationsResponseDto> {
    return this.jobApplicationsService.findByJob(id, req.user, query);
  }
}
