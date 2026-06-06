import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseFilePipeBuilder } from '@nestjs/common';
import { CvService } from './service/cv.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { Response } from 'express';
import { PdfParserService } from './service/pdf-parser.service';
import { UserRole } from '@/common/enum/index.enum';
import { SaveParsedCvDto } from './dto/save-parsed-cv.dto';

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;

@Controller('cv')
@UseGuards(AuthGuard('jwt'))
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly pdfParserService: PdfParserService,
  ) {}

  @Get()
  async findMyCvs(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.cvService.findMyCvs(user.id);
  }

  @Get('me')
  async findMyCvsAlias(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.cvService.findMyCvs(user.id);
  }

  @Get('user/:userId')
  async findCvsByUserId(@Param('userId') userId: string, @Req() req: Request) {
    const viewer = req.user as { id: string; role: UserRole };
    return this.cvService.findCvsByUserId(userId, viewer);
  }

  @Get(':id/preview')
  async previewCv(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const viewer = req.user as { id: string; role: UserRole };
    const { cv, buffer } = await this.cvService.getCvPreview(id, viewer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${cv.fileName.replace(/"/g, '')}"`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    return res.send(buffer);
  }

  @Get(':id')
  async findCvById(@Param('id') id: string, @Req() req: Request) {
    const viewer = req.user as { id: string; role: UserRole };
    return this.cvService.findCvById(id, viewer);
  }

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

  @Post('save-parsed-cv')
  async saveParsedCv(@Body() dto: SaveParsedCvDto) {
    return this.cvService.saveParsedCv(dto);
  }
}
