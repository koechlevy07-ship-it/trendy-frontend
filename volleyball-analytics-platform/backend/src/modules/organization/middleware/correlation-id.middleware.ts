/**
 * Correlation ID Middleware - Chapter 11 Part 4
 * 
 * Generates and propagates correlation IDs for request tracing.
 * Every request/response must carry a correlation ID for distributed tracing.
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorrelationIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    // Extract or generate correlation ID
    const correlationId = this.extractOrGenerateCorrelationId(req);
    
    // Set correlation ID on request for downstream use
    (req as any).correlationId = correlationId;
    
    // Set response header for client-side tracing
    res.setHeader('X-Correlation-ID', correlationId);
    
    // Log request with correlation ID
    this.logger.log(
      `Incoming ${req.method} ${req.path}`,
      { correlationId, method: req.method, path: req.path, ip: req.ip }
    );

    next();
  }

  private extractOrGenerateCorrelationId(req: Request): string {
    // Check for incoming correlation ID from headers
    const incomingId = 
      req.headers['x-correlation-id'] as string ||
      req.headers['x-request-id'] as string ||
      req.headers['x-trace-id'] as string;

    if (incomingId && this.isValidCorrelationId(incomingId)) {
      return incomingId;
    }

    // Generate new UUID v4 correlation ID
    return uuidv4();
  }

  private isValidCorrelationId(id: string): boolean {
    // UUID v4 format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}