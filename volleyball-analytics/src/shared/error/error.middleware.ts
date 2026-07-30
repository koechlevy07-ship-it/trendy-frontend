import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../shared/logger';
import { ValidationException } from '../shared/validator';
import { AuthorizationError } from '../shared/rbac';

const logger = createLogger('ErrorHandler');

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string, code = 'UNPROCESSABLE_ENTITY') {
    super(message, 422, code);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, code = 'BUSINESS_RULE_VIOLATION') {
    super(message, 422, code);
  }
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const correlationId = (req as any).correlationId || 'unknown';
  
  logger.error('Unhandled error', {
    correlationId,
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
    statusCode: (err as any).statusCode || 500,
  });
  
  if (err instanceof ValidationException) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.field,
        message: e.message,
        code: e.code,
        value: e.value,
      })),
      timestamp: new Date().toISOString(),
    });
  }
  
  if (err instanceof AuthorizationError) {
    return res.status(403).json({
      success: false,
      message: err.message,
      errors: [{ code: err.code, message: err.message }],
      timestamp: new Date().toISOString(),
    });
  }
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: [{ code: err.code, message: err.message }],
      timestamp: new Date().toISOString(),
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message,
        code: 'VALIDATION_ERROR',
      })),
      timestamp: new Date().toISOString(),
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      errors: [{ code: 'INVALID_ID', message: 'Invalid ID format' }],
      timestamp: new Date().toISOString(),
    });
  }
  
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors: [{ code: 'DUPLICATE_KEY', message: `${field} already exists` }],
      timestamp: new Date().toISOString(),
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: [{ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }],
    timestamp: new Date().toISOString(),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    errors: [{ code: 'ROUTE_NOT_FOUND', message: 'The requested resource was not found' }],
    timestamp: new Date().toISOString(),
  });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}