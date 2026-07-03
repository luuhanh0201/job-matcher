import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/Guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserRole } from '@/common/enum/index.enum';
import { JobPostResponseDto } from '@/modules/jobs/dto/job-response.dto';
import { User } from '@/modules/user/entities/user.entity';
import { SavedJobResponseDto } from './dto/saved-job-response.dto';
import { SavedJobsService } from './saved-jobs.service';

@Controller('saved-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CANDIDATE)
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  @Get('my')
  async findMySavedJobs(
    @Request() req: Request & { user: User },
  ): Promise<JobPostResponseDto[]> {
    return this.savedJobsService.findMySavedJobs(req.user);
  }

  @Get('my/ids')
  async findMySavedJobIds(
    @Request() req: Request & { user: User },
  ): Promise<string[]> {
    return this.savedJobsService.findMySavedJobIds(req.user);
  }

  @Post(':jobId')
  async save(
    @Request() req: Request & { user: User },
    @Param('jobId', new ParseUUIDPipe({ version: '4' })) jobId: string,
  ): Promise<SavedJobResponseDto> {
    return this.savedJobsService.save(jobId, req.user);
  }

  @Delete(':jobId')
  async unsave(
    @Request() req: Request & { user: User },
    @Param('jobId', new ParseUUIDPipe({ version: '4' })) jobId: string,
  ): Promise<SavedJobResponseDto> {
    return this.savedJobsService.unsave(jobId, req.user);
  }
}
