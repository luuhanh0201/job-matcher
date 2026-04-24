import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParsedCvService } from './parsed-cv.service';
import { CreateParsedCvDto } from './dto/create-parsed-cv.dto';
import { UpdateParsedCvDto } from './dto/update-parsed-cv.dto';

@Controller('parsed-cv')
export class ParsedCvController {
  constructor(private readonly parsedCvService: ParsedCvService) {}

  @Post()
  create(@Body() createParsedCvDto: CreateParsedCvDto) {
    return this.parsedCvService.create(createParsedCvDto);
  }

  @Get()
  findAll() {
    return this.parsedCvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parsedCvService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParsedCvDto: UpdateParsedCvDto) {
    return this.parsedCvService.update(+id, updateParsedCvDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parsedCvService.remove(+id);
  }
}
