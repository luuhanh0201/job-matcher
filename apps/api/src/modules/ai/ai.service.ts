import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService implements OnModuleInit {
    private readonly logger = new Logger(AiService.name);
    private client!: Anthropic;
    private model!: string;
    private maxTokens!: number;

    constructor(
        private readonly configService: ConfigService,
    ) { }
    onModuleInit() {
        const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
        if (!apiKey) {
            this.logger.warn('ANTHROPIC_API_KEY is not set. AI features will be disabled.');
            return;
        }
        this.client = new Anthropic({ apiKey });
        this.model = this.configService.get<string>('ANTHROPIC_MODEL') || 'claude-sonnet-4-5';
        const maxTokensRaw = this.configService.get<string>('ANTHROPIC_MAX_TOKENS');
        const parsedMaxTokens = Number.parseInt(maxTokensRaw ?? '', 10);
        this.maxTokens = Number.isInteger(parsedMaxTokens) && parsedMaxTokens > 0
            ? parsedMaxTokens
            : 1024;

        this.logger.log(`Anthropic client initialized with model ${this.model} and max tokens ${this.maxTokens}`);
    }

    async chat(userMessage: string): Promise<string> {
        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: this.maxTokens,
            messages: [
                { role: 'user', content: userMessage },
            ],
        });

        const block = response?.content[0];

        if (block?.type !== 'text') {
            throw new Error("Unexpected response type from Anthropic API");
        }
        return block.text;
    }

    async chatWithSystem(
        systemPrompt: string,
        userMessage: string,
    ): Promise<string> {
        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: this.maxTokens,
            system: systemPrompt,
            messages: [
                { role: 'user', content: userMessage },
            ],
        });

        const block = response?.content[0];

        if (block?.type !== 'text') {
            throw new Error("Unexpected response type from Anthropic API");
        }
        return block.text;
    }

    async multiTurnChat(
        messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    ): Promise<string> {
        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: this.maxTokens,
            messages,
        });

        const block = response.content[0];
        if (block.type !== 'text') {
            throw new Error('Unexpected response type from Anthropic');
        }

        return block.text;
    }
}

