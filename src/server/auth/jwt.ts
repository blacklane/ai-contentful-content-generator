import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}

export class JWTManager {
  private secret: string;
  private sessionDuration: number; // in minutes

  constructor() {
    // Generate secret if not provided in env
    this.secret = process.env.JWT_SECRET || this.generateSecret();
    this.sessionDuration = parseInt(
      process.env.SESSION_DURATION_MINUTES || '25',
    );

    // Validate configuration
    if (!process.env.JWT_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'JWT_SECRET must be set in production environment variables',
        );
      }
      console.warn(
        'JWT_SECRET not provided in environment variables. Using auto-generated secret.',
      );
      console.warn(
        'For production, please set JWT_SECRET in your environment variables.',
      );
    }

    // Validate session duration
    if (this.sessionDuration < 5 || this.sessionDuration > 480) {
      throw new Error(
        'SESSION_DURATION_MINUTES must be between 5 and 480 minutes',
      );
    }
  }

  private generateSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Generate JWT token for authenticated user
   */
  generateToken(username: string): string {
    const payload: Omit<AuthPayload, 'iat' | 'exp'> = {
      userId: 'admin', // Static user ID for now
      username,
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: `${this.sessionDuration}m`,
      issuer: 'contentful-ai-generator',
      audience: 'contentful-ai-generator-users',
    });
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): AuthPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: 'contentful-ai-generator',
        audience: 'contentful-ai-generator-users',
      }) as AuthPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.log('Invalid JWT token:', error.message);
      } else if (error instanceof jwt.TokenExpiredError) {
        console.log('JWT token expired:', error.message);
      }
      return null;
    }
  }

  /**
   * Get remaining time in milliseconds for token
   */
  getTokenRemainingTime(token: string): number {
    try {
      const decoded = jwt.decode(token) as AuthPayload;
      if (!decoded || !decoded.exp) {
        return 0;
      }

      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const remainingTime = expirationTime - currentTime;

      return Math.max(0, remainingTime);
    } catch {
      return 0;
    }
  }
}

// Singleton instance
export const jwtManager = new JWTManager();

/**
 * Express middleware to verify JWT authentication
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      code: 'TOKEN_REQUIRED',
    });
  }

  const decoded = jwtManager.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID',
    });
  }

  // Add user info to request object
  (req as any).user = decoded;
  next();
};

/**
 * Optional authentication middleware - allows both authenticated and unauthenticated requests
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = jwtManager.verifyToken(token);
    if (decoded) {
      (req as any).user = decoded;
    }
  }

  next();
};
