import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiAnalyzerService {
    private readonly logger = new Logger(AiAnalyzerService.name);

    constructor (){}
}
