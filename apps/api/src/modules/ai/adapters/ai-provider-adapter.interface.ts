export interface AiAdapterCallOptions {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface AiCallResult {
  text: string;
  usage: AiUsage;
}

export interface AiProviderAdapter {
  chat(
    userMessage: string,
    options: AiAdapterCallOptions,
  ): Promise<AiCallResult>;

  chatWithSystem(
    systemPrompt: string,
    userMessage: string,
    options: AiAdapterCallOptions,
  ): Promise<AiCallResult>;

  multiTurnChat(
    messages: AiChatMessage[],
    options: AiAdapterCallOptions,
  ): Promise<AiCallResult>;
}
