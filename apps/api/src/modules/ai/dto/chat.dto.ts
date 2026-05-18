import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;
}

export class MultiTurnChatDto {
  @IsArray()
  messages!: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export class ExtractCvDto {
  @IsString()
  @IsNotEmpty()
  cvText!: string;
}
