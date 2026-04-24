import { Injectable } from '@nestjs/common';
import { CreateParsedCvDto } from './dto/create-parsed-cv.dto';
import { UpdateParsedCvDto } from './dto/update-parsed-cv.dto';

@Injectable()
export class ParsedCvService {
  create(createParsedCvDto: CreateParsedCvDto) {
    return 'This action adds a new parsedCv';
  }

  findAll() {
    return `This action returns all parsedCv`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parsedCv`;
  }

  update(id: number, updateParsedCvDto: UpdateParsedCvDto) {
    return `This action updates a #${id} parsedCv`;
  }

  remove(id: number) {
    return `This action removes a #${id} parsedCv`;
  }
}
