export interface HealthCheckResponse {
  ok: boolean;
  timestamp: string;
  environment: string;
  config: {
    ai: {
      provider: string;
      baseUrl: string;
      model: string;
      configured: boolean;
    };
    contentful: {
      spaceId: string;
      environment: string;
      locale: string;
      configured: boolean;
    };
  };
  missingCredentials: string[];
}

export interface GenerationRequest {
  mainKeywords: string;
  secondaryKeywords: string;
  questions?: string;
  components: string[];
  language: string;
  conversationContext?: Array<{ role: string; content: string }>;
}

export interface PublishingRequest {
  generatedContent: Record<string, unknown>;
  releaseConfig: {
    title: string;
    publishImmediately?: boolean;
    draftOnly?: boolean;
  };
  imageUrls?: Record<string, string>;
}
