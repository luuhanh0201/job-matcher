import { Controller, Get } from '@nestjs/common';
import { AppService } from '@/app.service';
import { envFilePath } from 'typeorm.config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return (
      envFilePath +
      '<br>NODE_ENV: ' +
      process.env.NODE_ENV +
      '<br>DB_SYNCHRONIZE: ' +
      process.env.DB_SYNCHRONIZE
    );
  }
}
