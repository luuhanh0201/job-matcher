import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AiService } from './ai.service';
import { ChatDto, ExtractCvDto, MultiTurnChatDto } from './dto/chat.dto';
import { AiExtractorService } from './ai-extractor.service';
import { AiAnalyzerService } from './ai-analyzer.service';
import { AnalyzeCvDto } from './dto/analyze-cv.dto';
import { UserRole } from '@/common/enum/index.enum';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiExtractorService: AiExtractorService,
    private readonly aiAnalyzerService: AiAnalyzerService,
  ) {}

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
  @UseGuards(AuthGuard('jwt'))
  async analyzeCv(@Body() dto: AnalyzeCvDto, @Req() req: Request) {
    const user = req.user as { id: string; email: string; role: UserRole };
    const headerDeviceId = req.headers['x-device-id'];
    const deviceId =
      typeof headerDeviceId === 'string' && headerDeviceId.trim().length > 0
        ? headerDeviceId.trim()
        : `${req.ip ?? 'unknown-ip'}:${req.headers['user-agent'] ?? 'unknown-agent'}`;

    return this.aiAnalyzerService.analyzeCv(dto, {
      userId: user.id,
      deviceId,
    });
  }

  @Get('analyzer-prompt')
  async getAnalyzerPrompt() {
    return {
      systemPrompt: await this.aiAnalyzerService.getSystemPrompt(),
    };
  }
}
