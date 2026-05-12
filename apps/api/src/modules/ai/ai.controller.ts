import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto, ExtractCvDto, MultiTurnChatDto } from './dto/chat.dto';
import { AiExtractorService } from './ai-extractor.service';
import { AiAnalyzerService } from './ai-analyzer.service';
import { AnalyzeCvDto } from './dto/analyze-cv.dto';

@Controller('ai')
export class AiController {
    constructor(
        private readonly aiService: AiService,
        private readonly aiExtractorService: AiExtractorService,
        private readonly aiAnalyzerService: AiAnalyzerService,
    ) { }

    @Post('chat')
    async chat(@Body() dto: ChatDto) {
        const reply = dto.systemPrompt
            ? await this.aiService.chatWithSystem(dto.systemPrompt, dto.message)
            : await this.aiService.chat(dto.message);

        return { reply };
    }

    @Post('chat/multi-turn')
    async multiTurn(@Body() dto: MultiTurnChatDto) {
        const reply = await this.aiService.multiTurnChat(dto.messages);
        return { reply };
    }

    @Post('extract-cv')
    async extractCv(@Body() dto: ExtractCvDto) {
        return this.aiExtractorService.extractCv(dto.cvText);
    }

    @Post('analyze-cv')
    async analyzeCv(@Body() dto: AnalyzeCvDto) {
        return this.aiAnalyzerService.analyzeCv(dto);
    }

    @Get('analyzer-prompt')
    async getAnalyzerPrompt() {
        return {
            systemPrompt: await this.aiAnalyzerService.getSystemPrompt(),
        };
    }
}