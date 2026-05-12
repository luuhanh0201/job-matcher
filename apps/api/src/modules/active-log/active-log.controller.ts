import { Controller } from '@nestjs/common';
import { ActiveLogService } from './active-log.service';

@Controller('active-log')
export class ActiveLogController {
  constructor(private readonly activeLogService: ActiveLogService) {}
}
