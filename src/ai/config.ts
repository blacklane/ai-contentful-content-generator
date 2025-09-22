import { AIConfig } from './types';

export const createAIConfig = (): AIConfig => ({
  baseURL: process.env.AI_BASE_URL || 'https://ai-chat.blacklane.net/api/v1',
  apiKey: process.env.AI_API_KEY || '',
  model: process.env.AI_MODEL_ID || 'seo-landing-page-generator',
});

export const validateAIConfig = (config: AIConfig): boolean => {
  if (!config.apiKey) {
    console.warn('⚠️  AI_API_KEY not configured');
    return false;
  }
  return true;
};
