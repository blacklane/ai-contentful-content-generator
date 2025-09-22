import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils/logger';

/**
 * Security middleware for production deployment
 * Implements rate limiting, request validation, and security headers
 */

// Simple in-memory rate limiter (for production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window

/**
 * Rate limiting middleware
 */
export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const clientIp = getClientIp(req);
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Clean up old entries
  for (const [ip, data] of requestCounts.entries()) {
    if (data.resetTime < windowStart) {
      requestCounts.delete(ip);
    }
  }

  // Get or create rate limit data for this IP
  let rateLimitData = requestCounts.get(clientIp);
  if (!rateLimitData || rateLimitData.resetTime < windowStart) {
    rateLimitData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    requestCounts.set(clientIp, rateLimitData);
  }

  // Increment request count
  rateLimitData.count++;

  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': Math.max(
      0,
      RATE_LIMIT_MAX_REQUESTS - rateLimitData.count,
    ).toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimitData.resetTime / 1000).toString(),
  });

  // Check if rate limit exceeded
  if (rateLimitData.count > RATE_LIMIT_MAX_REQUESTS) {
    logger.warn(`Rate limit exceeded for IP: ${clientIp}`);
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  }

  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Security headers for production
  res.set({
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // XSS protection
    'X-XSS-Protection': '1; mode=block',
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Content Security Policy (basic)
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
    // Remove server information
    'X-Powered-By': '',
  });

  // Remove Express signature
  res.removeHeader('X-Powered-By');

  next();
};

/**
 * Request validation middleware
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Skip validation for public endpoints and auth routes
  if (
    (req.method === 'GET' &&
      (req.url.includes('/api/health') ||
        req.url.includes('/api/auth/status'))) ||
    req.url.includes('/api/auth/') ||
    req.url === '/' ||
    req.url.includes('/robots.txt') ||
    req.url.includes('/api/generate') || // Skip validation for content generation
    req.url.includes('/api/publish') // Skip validation for content publishing
  ) {
    return next();
  }

  // Check for suspicious patterns in request
  const suspiciousPatterns = [
    // SQL injection patterns
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
    // XSS patterns
    /<script[^>]*>.*?<\/script>/gi,
    // Path traversal
    /\.\.\//g,
    // Command injection - but exclude common chars in passwords
    /[;&|`${}[\]]/,
  ];

  const requestString = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestString)) {
      const clientIp = getClientIp(req);
      logger.warn(
        `Suspicious request detected from IP ${clientIp}: ${req.method} ${req.url}`,
      );

      return res.status(400).json({
        success: false,
        message: 'Invalid request format',
        code: 'INVALID_REQUEST',
      });
    }
  }

  // Validate Content-Type for POST/PUT requests with body
  if (
    ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    req.body &&
    Object.keys(req.body).length > 0
  ) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type must be application/json',
        code: 'INVALID_CONTENT_TYPE',
      });
    }
  }

  // Validate request size (Express already handles this, but double-check)
  const contentLength = req.get('Content-Length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    // 10MB limit
    return res.status(413).json({
      success: false,
      message: 'Request too large',
      code: 'REQUEST_TOO_LARGE',
    });
  }

  next();
};

/**
 * Auth-specific rate limiter for login attempts
 */
export const authRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const clientIp = getClientIp(req);
  const authKey = `auth_${clientIp}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Clean up old entries
  for (const [key, data] of requestCounts.entries()) {
    if (key.startsWith('auth_') && data.resetTime < windowStart) {
      requestCounts.delete(key);
    }
  }

  // Get or create auth rate limit data for this IP
  let rateLimitData = requestCounts.get(authKey);
  if (!rateLimitData || rateLimitData.resetTime < windowStart) {
    rateLimitData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    requestCounts.set(authKey, rateLimitData);
  }

  // Increment request count
  rateLimitData.count++;

  // Stricter limits for auth endpoints (5 attempts per 15 minutes)
  const AUTH_RATE_LIMIT = 5;
  if (rateLimitData.count > AUTH_RATE_LIMIT) {
    logger.warn(`Auth rate limit exceeded for IP: ${clientIp}`);
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    });
  }

  next();
};

/**
 * Get client IP address from request
 */
function getClientIp(req: Request): string {
  // Check various headers for the real IP (important for proxies/load balancers)
  const xForwardedFor = req.get('X-Forwarded-For');
  const xRealIp = req.get('X-Real-IP');
  const cfConnectingIp = req.get('CF-Connecting-IP'); // Cloudflare

  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }

  if (xRealIp) {
    return xRealIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to connection remote address
  return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
}
