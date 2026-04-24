import { ConfigService } from '@nestjs/config';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { JobsService } from '@/modules/jobs/jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  create(@Body() createJobDto: any) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  findAll() {
    console.log(
      'Check ',
      this.configService.get('NODE_ENV', { infer: true }) === 'development',
    );

    return this.jobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: any) {
    return this.jobsService.update(Number(id), updateJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(Number(id));
  }
}
