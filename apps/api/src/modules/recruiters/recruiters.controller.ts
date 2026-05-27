import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RecruitersService } from './recruiters.service';
import { JwtAuthGuard } from '../auth/Guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { CreateRecruiterProfileDto } from './dto/recruiters-profile.repository';
import { UpdateRecruiterProfileDto } from './dto/update-recruiter-profile.dto';

@Controller('recruiters')
export class RecruitersController {
  constructor(private readonly recruitersService: RecruitersService) {}

  @Post('create-profile')
  @UseGuards(JwtAuthGuard)
  async createRecruiterProfile(
    @Request() req: Request & { user: User },
    @Body() createRecruiterProfileDto: CreateRecruiterProfileDto,
  ) {
    const recruiter = await this.recruitersService.createRecruiterProfile(
      req?.user?.id,
      createRecruiterProfileDto,
    );
    return recruiter;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getRecruiterProfile(@Request() req: Request & { user: User }) {
    const profile = await this.recruitersService.getRecruiterProfile(
      req?.user?.id,
    );
    return profile;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateRecruiterProfile(
    @Request() req: Request & { user: User },
    @Body() updateRecruiterProfileDto: UpdateRecruiterProfileDto,
  ) {
    return await this.recruitersService.updateRecruiterProfile(
      req?.user?.id,
      updateRecruiterProfileDto,
    );
  }
}
