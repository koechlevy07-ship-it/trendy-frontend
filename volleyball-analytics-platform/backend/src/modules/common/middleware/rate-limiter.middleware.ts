import { Injectable, NestMiddleware, Logger, TooManyRequestsException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (req: Request) => string;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  blocked: boolean;
}

@Injectable()
export class RateLimiterMiddleware {
  private readonly logger = new Logger(RateLimiterMiddleware.name);
  private readonly store = new Map<string, RateLimitInfo>();
  private readonly defaultConfig: RateLimitConfig;

  constructor(private readonly configService: ConfigService) {
    this.defaultConfig = {
      windowMs: this.configService.get<number>('RATE_LIMIT_WINDOW_MS') || 60000, // 1 minute
      maxRequests: this.configService.get<number>('RATE_LIMIT_MAX_REQUESTS') || 100,
      keyGenerator: (req) => this.defaultKeyGenerator(req),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    };

    // Cleanup expired entries periodically
    setInterval(() => this.cleanup(), 60000);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const config = this.getConfigForEndpoint(req);
    const key = config.keyGenerator(req);
    const now = Date.now();

    let limitInfo = this.store.get(key);
    
    if (!limitInfo || now > limitInfo.resetTime) {
      // New window
      limitInfo = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false,
      };
      this.store.set(key, limitInfo);
    }

    // Check if blocked
    if (limitInfo.blocked || limitInfo.count >= config.maxRequests) {
      limitInfo.blocked = true;
      
      const retryAfter = Math.ceil((limitInfo.resetTime - Date.now()) / 1000);
      
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(limitInfo.resetTime / 1000));
      res.setHeader('Retry-After', retryAfter);

      this.logger.warn('Rate limit exceeded', {
        correlationId: (req as any).correlationId,
        key,
        count: limitInfo.count,
        limit: config.maxRequests,
        windowMs: config.windowMs,
        ip: req.ip,
      });

      throw new TooManyRequestsException({
        success: false,
        statusCode: 429,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Limit: ${config.maxRequests} per ${config.windowMs / 1000}s`,
          details: [],
          retryAfter: Math.ceil((limitInfo.resetTime - Date.now()) / 1000),
          correlationId: (req as any).correlationId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Increment counter
    limitInfo.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - limitInfo.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(limitInfo.resetTime / 1000));

    next();
  }

  private getConfigForEndpoint(req: Request): RateLimitConfig {
    // Stricter limits for write operations
    const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const isAuth = req.path.includes('/auth/');
    const isSearch = req.path.includes('/search');

    if (isAuth) {
      return { ...this.defaultConfig, maxRequests: 5, windowMs: 60000 }; // 5/min for auth
    }

    if (isSearch) {
      return { ...this.defaultConfig, maxRequests: 60, windowMs: 60000 }; // 60/min for search
    }

    if (isWrite) {
      return { ...this.defaultConfig, maxRequests: 30, windowMs: 60000 }; // 30/min for writes
    }

    return this.defaultConfig;
  }

  private defaultKeyGenerator(req: Request): string {
    const user = (req as any).user;
    const tenantId = (req as any).tenantId;
    
    // Prefer user ID, fallback to IP + tenant
    if (user?.userId) {
      return `ratelimit:user:${user.userId}:${req.method}:${req.path}`;
    }
    
    return `ratelimit:ip:${req.ip}:tenant:${tenantId}:${req.method}:${req.path}`;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, info] of this.store.entries()) {
      if (now > info.resetTime) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Rate limiter cleanup: removed ${cleaned} expired entries`);
    }
  }
}