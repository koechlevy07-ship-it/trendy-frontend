import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export type LogLevelType = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

@Injectable()
export class LoggingService {
  private readonly logger: winston.Logger;
  private readonly sensitiveFields = [
    'password', 'token', 'secret', 'key', 'authorization',
    'creditCard', 'ssn', 'nationalId', 'passport',
    'apiKey', 'accessToken', 'refreshToken',
    'biometricData', 'faceEmbedding', 'fingerprint',
    'jwt', 'refreshToken', 'sessionId',
  ];

  constructor() {
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const environment = process.env.NODE_ENV || 'development';
    const logDir = process.env.LOG_DIR || './logs';

    const transports: winston.transport[] = [
      // Console transport
      new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
          winston.format.errors({ stack: true }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
            let log = `${timestamp} [${level}]`;
            if (correlationId) log += ` [${correlationId}]`;
            log += `: ${message}`;
            if (Object.keys(meta).length > 0) {
              log += ` ${JSON.stringify(meta)}`;
            }
            return log;
          }),
        ),
      }),
    ];

    // File transports for production
    if (environment === 'production') {
      transports.push(
        // Application logs
        new DailyRotateFile({
          filename: `${logDir}/application-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        // Error logs
        new DailyRotateFile({
          filename: `${logDir}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '90d',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        // Audit logs
        new DailyRotateFile({
          filename: `${logDir}/audit-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '50m',
          maxFiles: '365d',
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );
    }

    return winston.createLogger({
      level: logLevel,
      transports,
      defaultMeta: {
        service: 'volleyball-analytics-platform',
        environment,
        version: process.env.APP_VERSION || '1.0.0',
      },
      exceptionHandlers: [
        new winston.transports.Console(),
        new DailyRotateFile({
          filename: `${logDir}/exceptions-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '90d',
        }),
      ],
      rejectionHandlers: [
        new winston.transports.Console(),
        new DailyRotateFile({
          filename: `${logDir}/rejections-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '90d',
        }),
      ],
    });
  }

  /**
   * Log with structured data and sensitive field filtering
   */
  log(level: LogLevelType, message: string, meta: Record<string, any> = {}): void {
    const sanitizedMeta = this.sanitize(meta);
    this.logger.log(level, message, sanitizedMeta);
  }

  trace(message: string, meta: Record<string, any> = {}): void {
    this.log('trace', message, meta);
  }

  debug(message: string, meta: Record<string, any> = {}): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta: Record<string, any> = {}): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta: Record<string, any> = {}): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta: Record<string, any> = {}): void {
    this.log('error', message, meta);
  }

  fatal(message: string, meta: Record<string, any> = {}): void {
    this.log('fatal', message, meta);
  }

  /**
   * Log audit event
   */
  audit(event: {
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    organizationId: string;
    tenantId: string;
    correlationId: string;
    success: boolean;
    duration: number;
    ipAddress: string;
    userAgent: string;
    oldValues?: any;
    newValues?: any;
  }): void {
    this.info('AUDIT', {
      ...event,
      logType: 'audit',
    });
  }

  /**
   * Log security event
   */
  security(event: {
    type: 'auth_failure' | 'authz_failure' | 'tenant_isolation_violation' | 'rate_limit' | 'suspicious_activity';
    userId?: string;
    tenantId: string;
    organizationId?: string;
    correlationId: string;
    ipAddress: string;
    userAgent: string;
    details: Record<string, any>;
  }): void {
    this.warn('SECURITY_EVENT', {
      ...event,
      logType: 'security',
    });
  }

  /**
   * Log performance metric
   */
  performance(metric: {
    operation: string;
    durationMs: number;
    success: boolean;
    tenantId: string;
    organizationId?: string;
    correlationId: string;
    metadata?: Record<string, any>;
  }): void {
    this.info('PERFORMANCE', {
      ...metric,
      logType: 'performance',
    });
  }

  /**
   * Sanitize sensitive data from log metadata
   */
  private sanitize(meta: Record<string, any>): Record<string, any> {
    if (!meta || typeof meta !== 'object') return meta;

    const sanitized = { ...meta };
    
    // Remove sensitive fields from body
    if (sanitized.body) {
      sanitized.body = this.deepSanitize(sanitized.body, this.sensitiveFields);
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

  /**
   * Get logger instance for direct access
   */
  getLogger(): winston.Logger {
    return this.logger;
  }
}