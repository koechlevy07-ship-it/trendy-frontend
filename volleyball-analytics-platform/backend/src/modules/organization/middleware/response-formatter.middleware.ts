/**
 * Response Formatter Middleware - Chapter 11 Part 4
 * 
 * Ensures all responses follow the standardized API response format.
 * Wraps successful responses and error responses in consistent structure.
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ResponseFormatterMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ResponseFormatterMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    // Store original send method
    const originalSend = res.send;

    // Override send to format response
    res.send = function (body?: any): Response {
      const correlationId = (req as any).correlationId || 'unknown';
      const startTime = (req as any).startTime || Date.now();
      const durationMs = Date.now() - startTime;

      // Don't format if already formatted (e.g., by exception filter)
      const isAlreadyFormatted = body && typeof body === 'object' && 'success' in body;
      
      if (!isAlreadyFormatted && body !== null && body !== undefined) {
        const statusCode = res.statusCode;
        const isSuccess = statusCode >= 200 && statusCode < 300;

        if (isSuccess) {
          // Format success response
          body = {
            success: true,
            message: this.getSuccessMessage(req.method, statusCode, res.get('X-Message')),
            data: body,
            meta: {
              durationMs,
              timestamp: new Date().toISOString(),
              correlationId,
              path: req.path,
            },
          };
        } else {
          // Format error response (if not already handled by exception filter)
          if (!res.headersSent) {
            body = {
              success: false,
              message: this.getErrorMessage(statusCode, body),
              data: null,
              error: {
                code: this.getErrorCode(statusCode),
                message: body?.message || this.getErrorMessage(statusCode, body),
                details: body?.details || [],
                correlationId,
                timestamp: new Date().toISOString(),
              },
            };
          }
        }
      }

      // Add standard headers
      res.setHeader('X-Correlation-ID', correlationId);
      res.setHeader('X-Response-Time', `${durationMs}ms`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Call original send
      return originalSend.call(this, body);
    }.bind(res);

    next();
  }

  private getSuccessMessage(method: string, statusCode: number, customMessage?: string): string {
    if (customMessage) return customMessage;
    
    const messages: Record<string, Record<number, string>> = {
      GET: { 200: 'Resource retrieved successfully' },
      POST: { 201: 'Resource created successfully' },
      PUT: { 200: 'Resource updated successfully' },
      PATCH: { 200: 'Resource partially updated successfully' },
      DELETE: { 204: 'Resource deleted successfully', 200: 'Resource deleted successfully' },
    };
    
    return messages[method]?.[statusCode] || 'Operation completed successfully';
  }

  private getErrorMessage(statusCode: number, body: any): string {
    if (body?.message) return body.message;
    
    const messages: Record<number, string> = {
      400: 'Bad request - invalid input',
      401: 'Authentication required',
      403: 'Access denied - insufficient permissions',
      404: 'Resource not found',
      409: 'Resource conflict - duplicate or constraint violation',
      422: 'Validation failed',
      429: 'Too many requests',
      500: 'Internal server error',
      503: 'Service temporarily unavailable',
    };
    
    return messages[statusCode] || 'An error occurred';
  }

  private getErrorCode(statusCode: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };
    
    return codes[statusCode] || 'ERROR';
  }
}