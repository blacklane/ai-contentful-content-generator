import cors from 'cors';
import express from 'express';
import path from 'path';
import { getServerConfig } from './config';
import {
  rateLimiter,
  securityHeaders,
  validateRequest,
} from './middleware/security';

export const setupMiddleware = (app: express.Application) => {
  const config = getServerConfig();

  // Security middleware (applied first)
  app.use(securityHeaders);
  app.use(rateLimiter);
  app.use(validateRequest);

  // Trust proxy for production deployment (AWS, Vercel, etc.)
  if (config.nodeEnv === 'production') {
    app.set('trust proxy', 1);
  }

  // Allow network access in development
  const corsOptions = {
    origin:
      config.nodeEnv === 'development'
        ? true // Allow all origins in development for network access
        : config.corsOrigin,
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(path.join(__dirname, '../../public')));
};
