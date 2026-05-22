import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { time } from 'console';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}
  @Get()
  async checkHealth() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok' };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
        database: 'disconnected',
      };
    }
  }
}
