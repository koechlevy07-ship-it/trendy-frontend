/**
 * Global Exception Filter - Chapter 11 Part 4
 * 
 * Centralized exception handling with standardized error responses.
 * Catches all unhandled exceptions and formats them consistently.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  TooManyRequestsException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const correlationId = (request as any).correlationId || 'unknown';
    const startTime = (request as any).startTime || Date.now();
    const durationMs = Date.now() - startTime;

    // Determine status code and error details
    const { statusCode, errorCode, message, details } = this.extractErrorDetails(exception);

    // Log the exception
    this.logException(exception, request, correlationId, statusCode, durationMs);

    // Don't send response if already sent
    if (response.headersSent) {
      return;
    }

    // Send standardized error response
    response.status(statusCode).json({
      success: false,
      message: message || this.getDefaultMessage(statusCode),
      data: null,
      error: {
        code: errorCode,
        message: message || this.getDefaultMessage(statusCode),
        details: details || [],
        correlationId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private extractErrorDetails(exception: unknown): {
    statusCode: number;
    errorCode: string;
    message: string;
    details?: any[];
  } {
    // Known HTTP exceptions
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message = typeof response === 'string' ? response : (response as any).message;
      const details = (response as any).details || (response as any).errors;

      return {
        statusCode: exception.getStatus(),
        errorCode: this.getErrorCodeForStatus(exception.getStatus()),
        message: Array.isArray(message) ? message.join(', ') : message,
        details: Array.isArray(details) ? details : details ? [details] : [],
      };
    }

    // MongoDB duplicate key error
    if (exception instanceof MongoServerError) {
      if (exception.code === 11000) {
        const field = Object.keys(exception.keyValue || {})[0];
        return {
          statusCode: HttpStatus.CONFLICT,
          errorCode: 'DUPLICATE_KEY',
          message: `Duplicate value for field: ${field}`,
          details: [{ field, value: exception.keyValue[field] }],
        };
      }
      
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: [exception.message],
      };
    }

    // TypeORM query failed
    if (exception instanceof QueryFailedError) {
      if (exception.driverError && (exception.driverError as any).code === '23505') {
        // PostgreSQL unique violation
        return {
          statusCode: HttpStatus.CONFLICT,
          errorCode: 'DUPLICATE_KEY',
          message: 'Duplicate entry violates unique constraint',
          details: [(exception.driverError as any).detail],
        };
      }

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: 'DATABASE_ERROR',
        message: 'Database query failed',
        details: [exception.message],
      };
    }

    // Validation errors (class-validator)
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      const details = (response as any).details || (response as any).errors;
      
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: Array.isArray(details) ? details : details ? [details] : [],
      };
    }

    // Unknown error
    const message = exception instanceof Error ? exception.message : 'Unknown error';
    
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message,
      details: process.env.NODE_ENV === 'development' 
        ? [exception instanceof Error ? exception.stack : String(exception)] 
        : [],
    };
  }

  private getErrorCodeForStatus(status: number): string {
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
    
    return codes[status] || 'ERROR';
  }

  private getDefaultMessage(statusCode: number): string {
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

  private logException(
    exception: unknown,
    request: Request,
    correlationId: string,
    statusCode: number,
    durationMs: number,
  ): void {
    const logData = {
      correlationId,
      method: request.method,
      path: request.path,
      statusCode,
      durationMs,
      ip: request.ip,
      userId: (request as any).user?.userId,
      tenantId: (request as any).tenantId,
      userAgent: request.headers['user-agent'],
    };

    if (statusCode >= 500) {
      this.logger.error(
        `Server error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
        logData,
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `Client error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        logData,
      );
    }
  }
}