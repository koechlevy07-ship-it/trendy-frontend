/**
 * Audit Logging Interceptor - Chapter 11 Part 4
 * 
 * Automatically generates immutable audit logs for all write operations.
 * Captures: user, organization, action, old/new values, correlation ID, device info
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../services/audit/audit.service';

const AUDIT_ACTION_KEY = 'audit_action';

@Injectable()
export class AuditLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLoggingInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const correlationId = (request as any).correlationId;
    const user = (request as any).user;
    const tenantContext = (request as any).tenantContext;
    const organizationContext = (request as any).organizationContext;

    // Determine audit action from decorator or infer from method
    const auditAction = this.getAuditAction(context);

    // Capture old values before mutation (for updates)
    const oldValues = this.captureOldValues(request);

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (result) => {
          // Capture new values after successful operation
          const newValues = this.captureNewValues(request, result);
          
          // Determine if operation was successful
          const success = response.statusCode >= 200 && response.statusCode < 300;
          
          // Create audit log
          await this.createAuditLog({
            correlationId,
            user,
            tenantContext,
            organizationContext,
            auditAction,
            method: request.method,
            path: request.path,
            oldValues,
            newValues,
            statusCode: response.statusCode,
            success,
            duration: Date.now() - startTime,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            device: this.parseDeviceInfo(request.headers['user-agent']),
          });
        },
        error: async (error) => {
          // Log failed operations too
          await this.createAuditLog({
            correlationId,
            user,
            tenantContext,
            organizationContext,
            auditAction,
            method: request.method,
            path: request.path,
            oldValues,
            newValues: null,
            statusCode: error.status || 500,
            success: false,
            duration: Date.now() - startTime,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            errorMessage: error.message,
          });
        },
      }),
    );
  }

  private getAuditAction(context: ExecutionContext): string {
    // Check for explicit audit action decorator
    const action = this.reflector.get<string>(AUDIT_ACTION_KEY, context.getHandler());
    if (action) return action;

    // Infer from HTTP method
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.path;

    // Map common patterns to audit actions
    if (method === 'POST') {
      if (path.includes('/organizations')) return 'organization_registered';
      if (path.includes('/teams')) return 'team_registered';
      if (path.includes('/facilities')) return 'facility_registered';
      if (path.includes('/memberships')) return 'membership_created';
    }
    if (method === 'PUT' || method === 'PATCH') {
      if (path.includes('/organizations')) return 'organization_updated';
      if (path.includes('/teams')) return 'team_updated';
      if (path.includes('/branding')) return 'branding_updated';
    }
    if (method === 'DELETE') {
      if (path.includes('/organizations')) return 'organization_archived';
      if (path.includes('/teams')) return 'team_archived';
    }

    return `${method.toLowerCase()}_${path.replace(/\//g, '_')}`;
  }

  private captureOldValues(request: any): any {
    // For updates, the old values might be in request.body before transformation
    // In practice, this would be captured in the service before the update
    return request.body?.oldValues || null;
  }

  private captureNewValues(request: any, result: any): any {
    // Extract the new state from the result
    return result?.data || result;
  }

  private parseDeviceInfo(userAgent: string): { browser: string; os: string; device: string } {
    // Simple user agent parsing (in production, use ua-parser-js)
    return {
      browser: 'unknown',
      os: 'unknown',
      device: 'unknown',
    };
  }

  private async createAuditLog(params: {
    correlationId: string;
    user: any;
    tenantContext: any;
    organizationContext: any;
    auditAction: string;
    method: string;
    path: string;
    oldValues: any;
    newValues: any;
    statusCode: number;
    success: boolean;
    duration: number;
    ip: string;
    userAgent: string;
    device: any;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await this.auditService.log({
        correlationId: params.correlationId,
        userId: params.user?.userId,
        userRole: params.user?.role,
        organizationId: params.organizationContext?.organization?.id,
        tenantId: params.tenantContext?.tenantId,
        action: params.auditAction,
        entityType: this.inferEntityType(params.path),
        entityId: params.organizationContext?.organization?.id,
        oldValues: params.oldValues,
        newValues: params.newValues,
        changedFields: this.computeChangedFields(params.oldValues, params.newValues),
        statusCode: params.statusCode,
        success: params.success,
        duration: params.duration,
        ipAddress: params.ip,
        device: JSON.stringify(params.device),
        userAgent: params.userAgent,
        correlationId: params.correlationId,
        errorMessage: params.errorMessage,
        result: params.success ? 'success' : 'failure',
      });
    } catch (err) {
      this.logger.error('Failed to create audit log', err.stack);
    }
  }

  private inferEntityType(path: string): string {
    if (path.includes('/organizations')) return 'organization';
    if (path.includes('/teams')) return 'team';
    if (path.includes('/facilities')) return 'facility';
    if (path.includes('/memberships')) return 'membership';
    if (path.includes('/hierarchy')) return 'hierarchy';
    if (path.includes('/branding')) return 'branding';
    if (path.includes('/invitations')) return 'invitation';
    return 'unknown';
  }

  private computeChangedFields(oldValues: any, newValues: any): string[] {
    if (!oldValues || !newValues) return [];
    
    const oldKeys = Object.keys(oldValues);
    const newKeys = Object.keys(newValues);
    const allKeys = new Set([...oldKeys, ...newKeys]);

    return Array.from(allKeys).filter(key => 
      JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])
    );
  }
}