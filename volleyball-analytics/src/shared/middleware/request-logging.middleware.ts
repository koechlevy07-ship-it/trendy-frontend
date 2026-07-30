import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../shared/logger';

const logger = createLogger('RequestLogger');

export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const correlationId = (req as any).correlationId;
  
  const originalSend = res.send;
  res.send = function(body?: any): Response {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    logger.info('Request completed', {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: (req as any).user?.userId,
      organizationId: (req as any).user?.organizationId,
    });
    
    return originalSend.call(this, body);
  };
  
  next();
}

export function performanceLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = process.hrtime.bigint();
  const correlationId = (req as any).correlationId;
  
  const originalSend = res.send;
  res.send = function(body?: any): Response {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    
    if (durationMs > 1000) {
      console.warn('Slow request detected', {
        correlationId,
        method: req.method,
        url: req.originalUrl,
        durationMs: Math.round(durationMs),
        statusCode: res.statusCode,
      });
    }
    
    return originalSend.call(this, body);
  };
  
  next();
}