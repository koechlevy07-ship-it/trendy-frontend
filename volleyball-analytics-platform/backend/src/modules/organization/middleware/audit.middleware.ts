/**
 * Audit Middleware - Chapter 11 Part 4
 * 
 * Automatically records audit logs for all write operations.
 * Captures user identity, organization, action, entity changes, and correlation ID.
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit/audit.service';
import { isWriteOperation } from '../utils/request.utils';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditMiddleware.name);

  constructor(private readonly auditService: AuditService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    
    // Capture original body for comparison
    const originalBody = JSON.parse(JSON.stringify(req.body));
    const originalParams = JSON.parse(JSON.stringify(req.params));

    // Only audit write operations
    if (!isWriteOperation(req.method)) {
      return next();
    }

    // Hook into response finish to capture audit data
    res.on('finish', async () => {
      if (res.statusCode >= 400) {
        // Still audit failed write attempts
        await this.recordAudit(req, res, originalBody, originalParams, false, Date.now() - startTime);
      } else {
        await this.recordAudit(req, res, originalBody, originalParams, true, Date.now() - startTime);
      }
    });

    next();
  }

  private async recordAudit(
    req: Request,
    res: Response,
    originalBody: any,
    originalParams: any,
    success: boolean,
    durationMs: number,
  ): Promise<void> {
    try {
      const user = (req as any).user;
      const correlationId = (req as any).correlationId;
      const tenantId = (req as any).tenantId;

      if (!user || !correlationId) {
        this.logger.warn('Audit skipped: missing user or correlation ID');
        return;
      }

      const entityType = this.extractEntityType(req.path);
      const entityId = this.extractEntityId(req.path, originalParams);
      const action = this.extractAction(req.method, req.path);

      // Get old values (would need to fetch from DB before operation)
      const oldValues = await this.getOldValues(entityType, entityId);
      
      await this.auditService.createAuditLog({
        auditId: this.generateAuditId(),
        userId: user.userId,
        userRole: user.role,
        action,
        entityType,
        entityId,
        oldValues,
        newValues: originalBody,
        changedFields: this.getChangedFields(oldValues, originalBody),
        correlationId,
        requestId: correlationId,
        endpoint: req.path,
        method: req.method,
        ipAddress: req.ip,
        device: req.headers['user-agent'],
        userAgent: req.headers['user-agent'],
        result: success ? 'success' : 'failure',
        errorMessage: success ? undefined : `HTTP ${res.statusCode}`,
        timestamp: new Date(),
      });

      this.logger.log(`Audit recorded: ${action} ${entityType}`, {
        correlationId,
        entityType,
        entityId,
        action,
        success,
        durationMs,
      });
    } catch (error) {
      this.logger.error('Failed to record audit', error.stack);
      // Don't throw - audit failure shouldn't break the request
    }
  }

  private extractEntityType(path: string): string {
    const parts = path.split('/').filter(Boolean);
    // /api/v1/organizations/123 -> organizations
    // /api/v1/teams/456 -> teams
    const resourceIndex = parts.findIndex(p => ['organizations', 'teams', 'facilities', 'memberships'].includes(p));
    return resourceIndex >= 0 ? parts[resourceIndex] : 'unknown';
  }

  private extractEntityId(path: string, params: any): string {
    // Extract ID from path parameters
    return params.organizationId || params.teamId || params.facilityId || params.id || 'unknown';
  }

  private extractAction(method: string, path: string): string {
    const entityType = this.extractEntityType(path);
    const actionMap: Record<string, string> = {
      POST: 'created',
      PUT: 'updated',
      PATCH: 'updated',
      DELETE: 'archived',
    };
    return `${entityType}_${actionMap[method] || 'modified'}`;
  }

  private async getOldValues(entityType: string, entityId: string): Promise<any> {
    // In real implementation, fetch from database before modification
    // This is a placeholder - actual implementation would query the repository
    return null;
  }

  private getChangedFields(oldValues: any, newValues: any): string[] {
    if (!oldValues || !newValues) return [];
    
    const changes: string[] = [];
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    
    allKeys.forEach(key => {
      if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
        changes.push(key);
      }
    });
    
    return changes;
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}