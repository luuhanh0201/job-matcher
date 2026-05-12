import { Module } from '@nestjs/common';
import { ActiveLogService } from './active-log.service';
import { ActiveLogController } from './active-log.controller';

@Module({
  controllers: [ActiveLogController],
  providers: [ActiveLogService],
})
export class ActiveLogModule {}
