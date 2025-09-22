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
  topic: string;
  keywords: string;
  components: string[];
  language: string;
  conversationContext?: Array<{ role: string; content: string }>;
}

export interface PublishingRequest {
  generatedContent: any;
  releaseMode?: string;
  releaseConfig?: {
    title: string;
    publishImmediately?: boolean;
    draftOnly?: boolean;
  };
  imageUrls?: Record<string, string>;
}
