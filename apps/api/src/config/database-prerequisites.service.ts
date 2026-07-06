import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ensureDatabasePrerequisites } from './database-prerequisites';

@Injectable()
export class DatabasePrerequisitesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabasePrerequisitesService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await ensureDatabasePrerequisites(this.dataSource);
    this.logger.log('Database extensions are ready: uuid-ossp, unaccent, vector');
  }
}
