/**
 * Response Formatter Interceptor - Chapter 11 Part 4
 * 
 * Standardizes all API responses to the contract:
 * {
 *   success: boolean,
 *   message: string,
 *   data: any,
 *   meta: any,
 *   timestamp: ISO-8601
 * }
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseFormatterInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseFormatterInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const correlationId = (request as any).correlationId;

    return next.handle().pipe(
      map((data) => {
        // If already formatted (e.g., by exception filter), return as-is
        if (this.isFormattedResponse(data)) {
          return data;
        }

        return {
          success: true,
          message: this.extractMessage(data),
          data: this.extractData(data),
          meta: this.extractMeta(data),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private isFormattedResponse(data: any): boolean {
    return data && 
      typeof data === 'object' && 
      'success' in data && 
      'timestamp' in data;
  }

  private extractMessage(data: any): string {
    if (!data) return 'Operation completed successfully';
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.data?.message) return data.data.message;
    return 'Operation completed successfully';
  }

  private extractData(data: any): any {
    if (!data) return null;
    if (data.data !== undefined) return data.data;
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') {
      // Exclude standard response fields
      const { message, meta, ...rest } = data;
      return Object.keys(rest).length > 0 ? rest : data;
    }
    return data;
  }

  private extractMeta(data: any): any {
    if (!data || typeof data !== 'object') return {};
    if (data.meta) return data.meta;
    if (data.pagination) return { pagination: data.pagination };
    if (data.total !== undefined) return { total: data.total };
    return {};
  }
}