import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrganizationAuditLog, OrganizationAuditLogDocument } from '../schemas/audit-log.schema';
import { CorrelationIdService } from './correlation-id.service';

export interface AuditLogEntry {
  auditId: string;
  correlationId: string;
  userId?: string;
  userRole?: string;
  organizationId?: string;
  tenantId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  statusCode: number;
  success: boolean;
  duration: number;
  ipAddress: string;
  device: string;
  userAgent: string;
  requestId?: string;
  endpoint: string;
  method: string;
  errorMessage?: string;
  result: 'success' | 'failure';
  timestamp: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(OrganizationAuditLog.name)
    private readonly auditLogModel: Model<OrganizationAuditLogDocument>,
    private readonly correlationIdService: CorrelationIdService,
  ) {}

  /**
   * Create an immutable audit log entry
   */
  async log(entry: AuditLogEntry): Promise<OrganizationAuditLogDocument> {
    try {
      const correlationId = entry.correlationId || this.correlationIdService.getId();
      
      const auditLog = new this.auditLogModel({
        ...entry,
        correlationId,
        timestamp: entry.timestamp || new Date(),
        immutable: true,
        createdAt: new Date(),
      });

      const saved = await auditLog.save();
      
      this.logger.debug('Audit log created', {
        auditId: saved.auditId,
        correlationId: saved.correlationId,
        action: saved.action,
        entityType: saved.entityType,
        success: saved.success,
      });

      return saved;
    } catch (error) {
      this.logger.error('Failed to create audit log', error.stack, {
        entry,
      });
      // Don't throw - audit failures shouldn't break the main operation
      throw error;
    }
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityAuditLogs(
    entityType: string,
    entityId: string,
    options: { limit?: number; offset?: number; sort?: 'asc' | 'desc' } = {},
  ): Promise<OrganizationAuditLogDocument[]> {
    const { limit = 100, offset = 0, sort = 'desc' } = options;

    return this.auditLogModel
      .find({ entityType, entityId: new Types.ObjectId(entityId) })
      .sort({ timestamp: sort === 'asc' ? 1 : -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(
    userId: string,
    options: { limit?: number; offset?: number; startDate?: Date; endDate?: Date } = {},
  ): Promise<OrganizationAuditLogDocument[]> {
    const { limit = 100, offset = 0, startDate, endDate } = options;

    const query: any = { userId: new Types.ObjectId(userId) };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    return this.auditLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Get audit logs for an organization
   */
  async getOrganizationAuditLogs(
    organizationId: string,
    options: { 
      limit?: number; 
      offset?: number; 
      startDate?: Date; 
      endDate?: Date;
      action?: string;
    } = {},
  ): Promise<OrganizationAuditLogDocument[]> {
    const { limit = 100, offset = 0, startDate, endDate, action } = options;

    const query: any = { organizationId: new Types.ObjectId(organizationId) };
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    return this.auditLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Get audit logs by correlation ID (for distributed tracing)
   */
  async getAuditLogsByCorrelationId(correlationId: string): Promise<OrganizationAuditLogDocument[]> {
    return this.auditLogModel
      .find({ correlationId })
      .sort({ timestamp: 1 })
      .lean()
      .exec();
  }

  /**
   * Get failed operations for monitoring
   */
  async getFailedOperations(
    options: { limit?: number; startDate?: Date; endDate?: Date } = {},
  ): Promise<OrganizationAuditLogDocument[]> {
    const { limit = 100, startDate, endDate } = options;

    const filter: any = { success: false };
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = startDate;
      if (endDate) filter.timestamp.$lte = endDate;
    }

    return this.auditLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    operationsByAction: Record<string, number>;
    operationsByEntity: Record<string, number>;
    averageDuration: number;
    successRate: number;
  }> {
    const filter: any = { tenantId };
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = startDate;
      if (endDate) filter.timestamp.$lte = endDate;
    }

    const [logs, totalCount] = await Promise.all([
      this.auditLogModel.find(filter).lean().exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    const successful = logs.filter(l => l.success).length;
    const failed = logs.filter(l => !l.success).length;

    const byAction = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byEntity = logs.reduce((acc, log) => {
      acc[log.entityType] = (acc[log.entityType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);

    return {
      totalOperations: totalCount,
      successfulOperations: successful,
      failedOperations: failed,
      operationsByAction: byAction,
      operationsByEntity: byEntity,
      averageDuration: logs.length > 0 ? totalDuration / logs.length : 0,
      successRate: totalCount > 0 ? successful / totalCount : 0,
    };
  }

  /**
   * Export audit logs for compliance (read-only)
   */
  async exportAuditLogs(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json',
  ): Promise<any> {
    const logs = await this.auditLogModel
      .find({
        tenantId,
        timestamp: { $gte: startDate, $lte: endDate },
      })
      .sort({ timestamp: 1 })
      .lean()
      .exec();

    if (format === 'csv') {
      return this.convertToCSV(logs);
    }

    return logs;
  }

  private convertToCSV(logs: OrganizationAuditLogDocument[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'auditId',
      'timestamp',
      'correlationId',
      'userId',
      'userRole',
      'action',
      'entityType',
      'entityId',
      'oldValues',
      'newValues',
      'changedFields',
      'statusCode',
      'success',
      'duration',
      'ipAddress',
      'device',
      'userAgent',
      'correlationId',
      'result',
    ];

    const rows = logs.map(log => [
      log.auditId,
      log.timestamp.toISOString(),
      log.correlationId,
      log.userId || '',
      log.userRole || '',
      log.action,
      log.entityType,
      log.entityId || '',
      JSON.stringify(log.oldValues || {}),
      JSON.stringify(log.newValues || {}),
      log.changedFields?.join(';') || '',
      log.statusCode.toString(),
      log.success.toString(),
      log.duration.toString(),
      log.ipAddress,
      log.device,
      log.userAgent,
      log.correlationId,
      log.result,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Verify audit log integrity (for compliance)
   */
  async verifyIntegrity(
    startDate: Date,
    endDate: Date,
  ): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check for missing timestamps
    const missingTimestamps = await this.auditLogModel.countDocuments({
      timestamp: { $exists: false },
      createdAt: { $gte: startDate, $lte: endDate },
    });
    if (missingTimestamps > 0) {
      issues.push(`${missingTimestamps} audit logs missing timestamps`);
    }

    // Check for duplicate audit IDs
    const duplicates = await this.auditLogModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$auditId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);
    if (duplicates.length > 0) {
      issues.push(`${duplicates.length} duplicate audit IDs found`);
    }

    // Check for gaps in sequence (if using sequential IDs)
    // This would require a different ID strategy

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}