import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/Guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserRole } from '@/common/enum/index.enum';
import {
  JobPostResponseDto,
  PaginatedJobsResponseDto,
} from '@/modules/jobs/dto/job-response.dto';
import { User } from '@/modules/user/entities/user.entity';
import { AdminService } from './admin.service';
import {
  AdminStatsResponseDto,
  AdminUserResponseDto,
  PaginatedAdminUsersResponseDto,
} from './dto/admin-response.dto';
import { QueryAdminJobsDto } from './dto/query-admin-jobs.dto';
import { QueryAdminUsersDto } from './dto/query-admin-users.dto';
import { UpdateAdminJobStatusDto } from './dto/update-admin-job-status.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async findUsers(
    @Query() query: QueryAdminUsersDto,
  ): Promise<PaginatedAdminUsersResponseDto> {
    return this.adminService.findUsers(query);
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Request() req: Request & { user: User },
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<AdminUserResponseDto> {
    return this.adminService.updateUserStatus(id, dto.status, req.user);
  }

  @Get('jobs')
  async findJobs(
    @Query() query: QueryAdminJobsDto,
  ): Promise<PaginatedJobsResponseDto> {
    return this.adminService.findJobs(query);
  }

  @Patch('jobs/:id/status')
  async updateJobStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateAdminJobStatusDto,
  ): Promise<JobPostResponseDto> {
    return this.adminService.updateJobStatus(id, dto.status);
  }

  @Get('stats')
  async getStats(): Promise<AdminStatsResponseDto> {
    return this.adminService.getStats();
  }
}
