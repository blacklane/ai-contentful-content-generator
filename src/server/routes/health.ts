import { Request, Response } from 'express';
import { validateEnvironment } from '../config';
import { HealthCheckResponse } from '../types';

export const healthCheck = (req: Request, res: Response) => {
  const missingEnvVars = validateEnvironment();

  const configStatus: HealthCheckResponse = {
    ok: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    config: {
      ai: {
        provider: process.env.AI_PROVIDER || 'blacklane',
        baseUrl:
          process.env.AI_BASE_URL || 'https://ai-chat.blacklane.net/api/v1',
        model: process.env.AI_MODEL_ID || 'seo-landing-page-generator',
        configured: !!process.env.AI_API_KEY,
      },
      contentful: {
        spaceId: process.env.CONTENTFUL_SPACE_ID
          ? '***configured***'
          : 'missing',
        environment: process.env.CONTENTFUL_ENVIRONMENT_ID || 'master',
        locale: 'en-US',
        configured: !!(
          process.env.CONTENTFUL_SPACE_ID &&
          process.env.CONTENTFUL_MANAGEMENT_TOKEN
        ),
      },
    },
    missingCredentials: missingEnvVars,
  };

  res.json(configStatus);
};
