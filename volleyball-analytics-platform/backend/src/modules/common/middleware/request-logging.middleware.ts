import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestLogging');

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const correlationId = this.generateCorrelationId();
    
    // Attach correlation ID to request
    (req as any).correlationId = correlationId;
    (res as any).correlationId = correlationId;

    // Add correlation ID to response header
    res.setHeader('X-Correlation-ID', correlationId);

    // Capture request details (excluding sensitive data)
    const requestLog = this.sanitizeRequest({
      correlationId,
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      body: req.body,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: (req as any).user?.userId,
      tenantId: (req as any).tenantId,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
    });

    this.logger.log('Incoming request', requestLog);

    // Capture response
    const originalSend = res.send;
    res.send = function (body?: any): Response {
      const duration = Date.now() - startTime;
      
      const responseLog = {
        correlationId,
        statusCode: res.statusCode,
        duration,
        responseSize: Buffer.byteLength(body || ''),
        success: res.statusCode >= 200 && res.statusCode < 300,
        userId: (req as any).user?.userId,
        tenantId: (req as any).tenantId,
      };

      if (res.statusCode >= 400) {
        this.logger.warn('Request completed with error', responseLog);
      } else {
        this.logger.debug('Request completed', responseLog);
      }

      // Log slow requests
      if (duration > 1000) {
        this.logger.warn('Slow request detected', {
          correlationId,
          method: req.method,
          path: req.path,
          duration,
        });
      }

      return originalSend.call(this, body);
    }.bind(this);

    next();
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeRequest(data: any): any {
    const sanitized = { ...data };
    
    // Remove sensitive fields from body
    if (sanitized.body) {
      const sensitiveFields = [
        'password', 'token', 'secret', 'key', 'authorization',
        'creditCard', 'ssn', 'nationalId', 'passport',
        'apiKey', 'accessToken', 'refreshToken',
        'biometricData', 'faceEmbedding', 'fingerprint',
      ];
      
      sanitized.body = this.deepSanitize(sanitized.body, sensitiveFields);
    }

    // Remove sensitive headers
    if (sanitized.headers) {
      sanitized.headers = this.deepSanitize(sanitized.headers, [
        'authorization', 'cookie', 'x-api-key', 'x-auth-token',
      ]);
    }

    return sanitized;
  }

  private deepSanitize(obj: any, sensitiveFields: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitize(item, sensitiveFields));
    }

    const sanitized = { ...obj };
    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.deepSanitize(sanitized[key], sensitiveFields);
      }
    }

    return sanitized;
  }
}