import { Request, Response, NextFunction } from 'express';
import { Validator } from '../shared/validator';

export function createValidationMiddleware<T>(validator: Validator<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validator.validate(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.map(e => ({
          field: e.field,
          message: e.message,
          code: e.code,
          value: e.value,
        })),
        timestamp: new Date().toISOString(),
      });
    }
    
    next();
  };
}

export function validateQueryParams<T>(validator: Validator<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validator.validate(req.query);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors: errors.map(e => ({
          field: e.field,
          message: e.message,
          code: e.code,
          value: e.value,
        })),
        timestamp: new Date().toISOString(),
      });
    }
    
    next();
  };
}

export function validatePathParams<T>(validator: Validator<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validator.validate(req.params);
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Path parameter validation failed',
        errors: errors.map(e => ({
          field: e.field,
          message: e.message,
          code: e.code,
          value: e.value,
        })),
        timestamp: new Date().toISOString(),
      });
    }
    
    next();
  };
}

export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  const sanitize = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized: any = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        
        if (typeof value === 'string') {
          sanitized[key] = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    
    return sanitized;
  };
  
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
}