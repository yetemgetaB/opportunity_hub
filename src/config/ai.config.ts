import { registerAs } from '@nestjs/config';

export interface AiConfig {
  apiKey?: string;
  model: string;
}

export default registerAs(
  'ai',
  (): AiConfig => ({
    apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY,
    model: process.env.AI_MODEL || 'gemini-3.8-flash',
  }),
);