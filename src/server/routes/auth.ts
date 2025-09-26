import { Request, Response, Router } from 'express';
import { logger } from '../../utils/logger';
import { credentialsManager, LoginCredentials } from '../auth/credentials';
import { jwtManager } from '../auth/jwt';
import { authRateLimiter } from '../middleware/security';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginCredentials = req.body;

    // Validate request body
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
        code: 'MISSING_CREDENTIALS',
      });
    }

    // Validate credentials
    const authResult = await credentialsManager.validateCredentials({
      username,
      password,
    });

    if (!authResult.success) {
      logger.warn(`Failed login attempt for username: ${username}`);
      return res.status(401).json({
        success: false,
        message: authResult.message,
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate JWT token
    const token = jwtManager.generateToken(authResult.username!);

    logger.info(`Successful login for username: ${authResult.username}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        username: authResult.username,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      code: 'AUTH_ERROR',
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify JWT token and return user info
 */
router.post('/verify', (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
        code: 'MISSING_TOKEN',
      });
    }

    const decoded = jwtManager.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        username: decoded.username,
        userId: decoded.userId,
        issuedAt: decoded.iat * 1000, // Convert to milliseconds
      },
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token verification',
      code: 'VERIFY_ERROR',
    });
  }
});

/**
 * GET /api/auth/status
 * Get authentication status and configuration
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const isConfigured = credentialsManager.isConfigured();

    res.json({
      success: true,
      data: {
        authEnabled: isConfigured,
        requiresAuth: isConfigured,
      },
    });
  } catch (error) {
    logger.error('Auth status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'STATUS_ERROR',
    });
  }
});

export default router;
