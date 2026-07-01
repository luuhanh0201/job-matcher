export type AiProviderVendor = "ANTHROPIC" | "OPENAI" | "GEMINI" | "GROQ";

export type AiProviderCheckStatus = "UNKNOWN" | "SUCCESS" | "FAILED";

export interface AiProvider {
  id: string;
  name: string;
  vendor: AiProviderVendor;
  model: string;
  maskedApiKey: string;
  maxTokens: number;
  isActive: boolean;
  lastCheckedAt?: string | null;
  lastCheckStatus: AiProviderCheckStatus;
  lastCheckMessage?: string | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAiProviderPayload {
  name: string;
  vendor: AiProviderVendor;
  model: string;
  apiKey: string;
  maxTokens?: number;
}

export type UpdateAiProviderPayload = Partial<CreateAiProviderPayload>;
