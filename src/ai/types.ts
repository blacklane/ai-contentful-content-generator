export interface GenerationParams {
  topic: string;
  keywords: string;
  contentTypes: string[];
  language: string;
  conversationContext?: Array<{ role: string; content: string }>;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

export interface ComponentSchema {
  type: string;
  [key: string]: any;
}
