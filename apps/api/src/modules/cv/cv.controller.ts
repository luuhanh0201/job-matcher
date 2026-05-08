import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvService } from './service/cv.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('cv')
@UseGuards(AuthGuard('jwt'))
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string; email: string };
    return this.cvService.uploadCv(user?.id, file);
  }

  @Post('save-parsed-cv')
  async saveParsedCv(@Body() body: Record<string, string>) {
    return this.cvService.saveParsedCv({
      cvId: body['cvId'] ?? '',
      candidateName: body['candidateName'],
      email: body['email'],
      phone: body['phone'],
      totalExperienceYears: body['totalExperienceYears'],
      currentTitle: body['currentTitle'],
      skills: body['skills'],
      education: body['education'],
      workExperience: body['workExperience'],
      certifications: body['certifications'],
      languages: body['languages'],
    });
  }
}
