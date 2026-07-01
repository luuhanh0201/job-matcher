import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiUsageLogEntity } from './entities/ai-usage-log.entity';
import { AiUsageLogsService } from './ai-usage-logs.service';
import { AiUsageController } from './ai-usage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AiUsageLogEntity])],
  controllers: [AiUsageController],
  providers: [AiUsageLogsService],
  exports: [AiUsageLogsService],
})
export class AiUsageModule {}
