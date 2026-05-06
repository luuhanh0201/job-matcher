import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { CvService } from './service/cv.service';
import { PdfParserService } from './service/pdf-parser.service';

type UploadedPdfFile = {
  mimetype: string;
  buffer: Buffer;
  originalname?: string;
  size?: number;
};

@Controller('cv')
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly pdfParserService: PdfParserService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(@UploadedFile() file: UploadedPdfFile) {
    const parsed = await this.pdfParserService.parsePdf(file);

    return {
      message: 'Upload and parse PDF successfully',
      fileName: file.originalname,
      fileSize: file.size,
      pages: parsed.pages,
      isScanned: parsed.isScanned,
      textLength: parsed.text.length,
      text: parsed.text,
    };
  }

  @Post()
  create(@Body() createCvDto: CreateCvDto) {
    return this.cvService.create(createCvDto);
  }

  @Get()
  findAll() {
    return this.cvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.update(+id, updateCvDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cvService.remove(+id);
  }
}
