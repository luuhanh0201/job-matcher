import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/Guards/jwt-auth.guard';
import { User } from '@/modules/user/entities/user.entity';
import { CandidateProfileResponseDto } from './dto/candidate-profile-response.dto';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';
import { CandidateProfilesService } from './candidate-profiles.service';

@Controller('candidate-profiles')
@UseGuards(JwtAuthGuard)
export class CandidateProfilesController {
  constructor(
    private readonly candidateProfilesService: CandidateProfilesService,
  ) {}

  @Get('me')
  async getMyProfile(
    @Request() req: Request & { user: User },
  ): Promise<CandidateProfileResponseDto> {
    return this.candidateProfilesService.getMyProfile(req.user);
  }

  @Patch('me')
  async updateMyProfile(
    @Request() req: Request & { user: User },
    @Body() updateCandidateProfileDto: UpdateCandidateProfileDto,
  ): Promise<CandidateProfileResponseDto> {
    return this.candidateProfilesService.updateMyProfile(
      req.user,
      updateCandidateProfileDto,
    );
  }

  @Get(':userId')
  async getProfileByUserId(
    @Request() req: Request & { user: User },
    @Param('userId') userId: string,
  ): Promise<CandidateProfileResponseDto> {
    return this.candidateProfilesService.getProfileByUserId(userId, req.user);
  }
}
