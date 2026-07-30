import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiResponseBuilder } from '../shared/api-response';

export interface FormattedResponse extends Response {
  apiResponse: {
    success: boolean;
    message: string;
    data?: any;
    meta?: Record<string, any>;
    timestamp: string;
    errors?: any[];
  };
}

export function responseFormatterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.json;
  
  res.json = function(data: any): Response {
    const correlationId = (req as any).correlationId;
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
    
    let formattedResponse: any;
    
    if (data && data.success !== undefined && data.timestamp) {
      return originalJson.call(this, data);
    }
    
    if (isSuccess) {
      formattedResponse = ApiResponseBuilder.success(data, 'Success', {
        correlationId,
      });
    } else {
      formattedResponse = ApiResponseBuilder.error(
        data?.message || 'Error',
        data?.errors || [],
        { correlationId }
      );
    }
    
    return originalJson.call(this, formattedResponse);
  };
  
  next();
}

export function responseFormatterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.json;
  
  res.json = function(data: any): Response {
    const correlationId = (req as any).correlationId;
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
    
    if (data && typeof data === 'object' && data.success !== undefined && data.timestamp) {
      return originalJson.call(this, data);
    }
    
    let formattedResponse: any;
    
    if (isSuccess) {
      formattedResponse = {
        success: true,
        message: data?.message || 'Success',
        data: data?.data ?? data,
        meta: data?.meta,
        timestamp: new Date().toISOString(),
        correlationId: (req as any).correlationId,
      };
    } else {
      formattedResponse = {
        success: false,
        message: data?.message || 'Error',
        errors: data?.errors || [{ code: 'ERROR', message: 'An error occurred' }],
        timestamp: new Date().toISOString(),
        correlationId: (req as any).correlationId,
      };
    }
    
    return originalJson.call(this, formattedResponse);
  };
  
  next();
}

export const responseFormatterMiddleware = responseFormatterMiddleware;