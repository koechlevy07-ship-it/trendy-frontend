import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../shared/logger';

const logger = createLogger('CorrelationMiddleware');

export interface CorrelationRequest extends Request {
  correlationId: string;
  startTime: number;
}

export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  
  (req as CorrelationRequest).correlationId = correlationId;
  (req as CorrelationRequest).startTime = Date.now();
  
  res.setHeader('X-Correlation-ID', correlationId);
  
  logger.debug('Request received', {
    correlationId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
  next();
}

export function getCorrelationId(req: Request): string {
  return (req as CorrelationRequest).correlationId;
}