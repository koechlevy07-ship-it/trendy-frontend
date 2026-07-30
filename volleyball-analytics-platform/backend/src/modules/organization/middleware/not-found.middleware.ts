/**
 * NotFound Middleware - Chapter 11 Part 4
 * 
 * Handles 404 Not Found errors with standardized response format.
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class NotFoundMiddleware implements NestMiddleware {
  private readonly logger = new Logger(NotFoundMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    // Check if route exists
    const originalSend = res.send;

    res.send = function (body?: any): Response {
      // If 404 and not already handled
      if (res.statusCode === 404 && !res.headersSent) {
        const correlationId = (req as any).correlationId || 'unknown';
        
        this.logger.warn('Route not found', {
          correlationId,
          method: req.method,
          path: req.path,
          ip: req.ip,
        });

        // Send standardized 404 response
        if (!res.headersSent) {
          res.status(404).json({
            success: false,
            message: 'Endpoint not found',
            data: null,
            error: {
              code: 'NOT_FOUND',
              message: `Route ${req.method} ${req.path} does not exist`,
              details: [],
              correlationId,
              timestamp: new Date().toISOString(),
            },
          });
          return res;
        }
      }
      
      return originalSend.call(this, body);
    }.bind(res);

    next();
  }
}