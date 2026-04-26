import {
  Delete,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UploadCloudinaryService } from './upload-cloudinary.service';

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;
@ApiTags('Upload Cloudinary')
@Controller('upload-cloudinary')
export class UploadCloudinaryController {
  constructor(
    private readonly uploadCloudinaryService: UploadCloudinaryService,
  ) {}

  @Post('pdf')
  @ApiOperation({ summary: 'Upload PDF file to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF file, max size 5MB',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'PDF uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        public_id: { type: 'string' },
        secure_url: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid file type or file size exceeds 5MB',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_PDF_SIZE_BYTES,
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  uploadPdf(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: MAX_PDF_SIZE_BYTES })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    },
  ) {
    return this.uploadCloudinaryService.uploadPdf(file);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete uploaded file from Cloudinary by publicId' })
  @ApiQuery({
    name: 'publicId',
    required: true,
    description: 'Cloudinary public_id returned from upload endpoint',
    example: 'job-matcher/uploads/cv-1714123000000',
  })
  @ApiResponse({
    status: 200,
    description: 'Delete operation completed',
    schema: {
      type: 'object',
      properties: {
        public_id: { type: 'string' },
        result: {
          type: 'string',
          enum: ['ok', 'not found'],
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'publicId is required' })
  removeFile(@Query('publicId') publicId: string) {
    return this.uploadCloudinaryService.deleteFile(publicId);
  }
}
