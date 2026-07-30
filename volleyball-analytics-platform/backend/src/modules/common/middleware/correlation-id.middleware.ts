import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorrelationIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    // Extract or generate correlation ID
    const correlationId = 
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      uuidv4();

    // Attach to request for downstream use
    (req as any).correlationId = correlationId;

    // Set response header for client tracing
    res.setHeader('X-Correlation-ID', correlationId);

    // Log incoming request with correlation ID
    this.logger.log(
      `Incoming ${req.method} ${req.path}`,
      { correlationId, method: req.method, path: req.path, ip: req.ip }
    );

    next();
  }
}