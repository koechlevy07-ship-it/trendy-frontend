import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../shared/logger';

const logger = createLogger('RateLimiterMiddleware');

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const DEFAULT_WINDOW_MS = 60000;
const DEFAULT_MAX_REQUESTS = 100;

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const windowMs = config.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = config.maxRequests || DEFAULT_MAX_REQUESTS;
  const keyGenerator = config.keyGenerator || defaultKeyGenerator;
  
  return (req: any, res: any, next: () => void): void => {
    const key = config.keyGenerator ? config.keyGenerator(req) : defaultKeyGenerator(req);
    const now = Date.now();
    
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < Date.now()) {
      entry = {
        count: 0,
        resetTime: Date.now() + windowMs,
      };
    }
    
    entry.count++;
    rateLimitStore.set(key, entry);
    
    const remaining = Math.max(0, maxRequests - entry.count);
    const resetTime = new Date(entry.resetTime).toISOString();
    
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTime);
    
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
      
      res.setHeader('Retry-After', retryAfter.toString());
      
      res.status(429).json({
        success: false,
        message: 'Too many requests',
        errors: [{
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        }],
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTime);
    
    next();
  };
}

function defaultKeyGenerator(req: any): string {
  const userId = req.user?.userId || req.ip;
  const path = req.route?.path || req.path;
  return `${userId}:${req.method}:${req.route?.path || req.path}`;
}

export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  return createRateLimiter(config);
}

export function getRateLimiter(config: Partial<RateLimitConfig> = {}) {
  return createRateLimiter(config);
}

export const strictRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 10,
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
});

export const authRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 5,
});