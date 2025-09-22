import { Router } from 'express';
import { authenticateToken } from '../auth/jwt';
import authRoutes from './auth';
import { generateContentRoute } from './generate';
import { healthCheck } from './health';
import { publishContentRoute } from './publish';

export const setupRoutes = (router: Router) => {
  // Authentication routes (no auth required)
  router.use('/api/auth', authRoutes);

  // Public routes
  router.get('/api/health', healthCheck);

  // Protected routes (require authentication)
  router.post('/api/generate', authenticateToken, generateContentRoute);
  router.post('/api/publish', authenticateToken, publishContentRoute);

  return router;
};
