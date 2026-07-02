import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @UseInterceptors(FileInterceptor('avatar'))
  @Patch('me/avatar')
  async updateMyAvatar(
    @Request() req: Request & { user: User },
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(png|jpeg|webp)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    avatar: Express.Multer.File,
  ): Promise<CandidateProfileResponseDto> {
    return this.candidateProfilesService.updateMyAvatar(req.user, avatar);
  }

  @Get(':userId')
  async getProfileByUserId(
    @Request() req: Request & { user: User },
    @Param('userId') userId: string,
  ): Promise<CandidateProfileResponseDto> {
    return this.candidateProfilesService.getProfileByUserId(userId, req.user);
  }
}
