import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseFilePipeBuilder } from '@nestjs/common';
import { CvService } from './service/cv.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { PdfParserService } from './service/pdf-parser.service';
import { UserRole } from '@/enum/index.enum';

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;

@Controller('cv')
@UseGuards(AuthGuard('jwt'))
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly pdfParserService: PdfParserService,
  ) { }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_PDF_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Chỉ cho phép file PDF'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadCv(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: MAX_PDF_SIZE_BYTES })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string; email: string; role: UserRole };
    const headerDeviceId = req.headers['x-device-id'];
    const deviceId =
      typeof headerDeviceId === 'string' && headerDeviceId.trim().length > 0
        ? headerDeviceId.trim()
        : `${req.ip ?? 'unknown-ip'}:${req.headers['user-agent'] ?? 'unknown-agent'}`;

    const uploadResult = await this.cvService.uploadCv(
      {
        userId: user.id,
        role: user.role,
        deviceId,
      },
      file,
    );
    const parsedPdf = await this.pdfParserService.parsePdf(file);

    return {
      ...uploadResult,
      parsedText: parsedPdf.text,
    };
  }

  // @Post('save-parsed-cv')
  // async saveParsedCv(@Body() body: Record<string, string>) {
  //   return this.cvService.saveParsedCv({
  //     cvId: body['cvId'] ?? '',
  //     candidateName: body['candidateName'],
  //     email: body['email'],
  //     phone: body['phone'],
  //     totalExperienceYears: body['totalExperienceYears'],
  //     currentTitle: body['currentTitle'],
  //     skills: body['skills'],
  //     education: body['education'],
  //     workExperience: body['workExperience'],
  //     certifications: body['certifications'],
  //     languages: body['languages'],
  //   });
  // }
}
