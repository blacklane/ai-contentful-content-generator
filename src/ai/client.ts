import { createAIConfig, validateAIConfig } from './config';
import { sendAIRequest, testAIConnection } from './http-client';
import { buildPrompt } from './prompt-builder';
import { AIResponse, GenerationParams } from './types';

export const generateContent = async (
  params: GenerationParams,
): Promise<AIResponse> => {
  const config = createAIConfig();

  if (!validateAIConfig(config)) {
    throw new Error('AI configuration is invalid');
  }

  try {
    const prompt = await buildPrompt(params);
    const response = await sendAIRequest(config, prompt);

    return response;
  } catch (error: unknown) {
    const err = error as {
      message: string;
      response?: { data: any; status: number };
    };
    console.error('❌ AI Request failed:');
    console.error('Error message:', err.message);
    console.error('Error response:', err.response?.data);
    console.error('Error status:', err.response?.status);

    throw new Error(`AI generation failed: ${err.message}`);
  }
};

export const testConnection = async (): Promise<boolean> => {
  const config = createAIConfig();

  if (!validateAIConfig(config)) {
    return false;
  }

  return testAIConnection(config);
};

// Legacy class wrapper for backward compatibility
export class BlacklaneAIClient {
  async generateContent(params: GenerationParams): Promise<AIResponse> {
    return generateContent(params);
  }

  async testConnection(): Promise<boolean> {
    return testConnection();
  }
}
