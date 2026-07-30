/**
 * Audit Service - Chapter 11 Part 4
 * 
 * Manages immutable audit log creation and querying.
 * All write operations on organizations/teams/facilities generate audit records.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrganizationAuditLog, OrganizationAuditLogDocument } from '../schemas/audit-log.schema';
import { CreateAuditLogDto } from '../dto/audit-log.dto';

export interface AuditLogQuery {
  tenantId?: string;
  organizationId?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAuditLogs {
  data: OrganizationAuditLogDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(OrganizationAuditLog.name)
    private readonly auditLogModel: Model<OrganizationAuditLogDocument>,
  ) {}

  /**
   * Create an immutable audit log entry
   */
  async log(dto: CreateAuditLogDto): Promise<OrganizationAuditLogDocument> {
    try {
      const auditLog = new this.auditLogModel({
        ...dto,
        auditId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        immutable: true,
      });

      const saved = await auditLog.save();
      
      this.logger.debug('Audit log created', {
        auditId: saved.auditId,
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId,
        correlationId: dto.correlationId,
        success: dto.success,
      });

      return saved;
    } catch (error) {
      this.logger.error('Failed to create audit log', error.stack);
      // Don't throw - audit failures shouldn't break the main operation
      return null as any;
    }
  }

  /**
   * Query audit logs with filters and pagination
   */
  async query(query: AuditLogQuery): Promise<PaginatedAuditLogs> {
    const filter: any = {};

    if (query.tenantId) filter.tenantId = query.tenantId;
    if (query.organizationId) filter.organizationId = query.organizationId;
    if (query.userId) filter.userId = query.userId;
    if (query.entityType) filter.entityType = query.entityType;
    if (query.entityId) filter.entityId = query.entityId;
    if (query.action) filter.action = { $regex: query.action, $options: 'i' };
    if (query.success !== undefined) filter.success = query.success;

    if (query.startDate || query.endDate) {
      filter.timestamp = {};
      if (query.startDate) filter.timestamp.$gte = query.startDate;
      if (query.endDate) filter.timestamp.$lte = query.endDate;
    }

    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100);
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    return {
      data: data as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get audit log by ID
   */
  async findById(auditId: string): Promise<OrganizationAuditLogDocument | null> {
    return this.auditLogModel.findOne({ auditId }).lean().exec();
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityHistory(
    entityType: string,
    entityId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<PaginatedAuditLogs> {
    return this.query({
      entityType,
      entityId,
      page: options.page,
      limit: options.limit,
    });
  }

  /**
   * Get audit logs by correlation ID (for distributed tracing)
   */
  async getByCorrelationId(correlationId: string): Promise<OrganizationAuditLogDocument[]> {
    return this.auditLogModel
      .find({ correlationId })
      .sort({ timestamp: 1 })
      .lean()
      .exec();
  }

  /**
   * Get audit logs by user
   */
  async getByUser(
    userId: string,
    options: { page?: number; limit?: number; startDate?: Date; endDate?: Date } = {},
  ): Promise<PaginatedAuditLogs> {
    return this.query({
      userId,
      page: options.page,
      limit: options.limit,
      startDate: options.startDate,
      endDate: options.endDate,
    });
  }

  /**
   * Get audit statistics
   */
  async getStatistics(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    byAction: Record<string, number>;
    byEntityType: Record<string, number>;
    byUser: Record<string, number>;
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

    const byAction: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    let totalDuration = 0;
    let successful = 0;

    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;
      byUser[log.userId || 'anonymous'] = (byUser[log.userId || 'anonymous'] || 0) + 1;
      totalDuration += log.duration;
      if (log.success) successful++;
    }

    return {
      totalOperations: totalCount,
      successfulOperations: successful,
      failedOperations: totalCount - successful,
      byAction,
      byEntityType,
      byUser,
      averageDuration: logs.length > 0 ? totalDuration / logs.length : 0,
      successRate: totalCount > 0 ? successful / totalCount : 0,
    };
  }

  /**
   * Get compliance report for auditors
   */
  async getComplianceReport(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    period: { start: Date; end: Date };
    summary: {
      totalChanges: number;
      dataModifications: number;
      administrativeActions: number;
      accessViolations: number;
      failedOperations: number;
    };
    details: OrganizationAuditLogDocument[];
  }> {
    const filter = {
      tenantId,
      timestamp: { $gte: startDate, $lte: endDate },
    };

    const [allLogs, failedLogs, modificationLogs, adminLogs] = await Promise.all([
      this.auditLogModel.find(filter).sort({ timestamp: 1 }).lean().exec(),
      this.auditLogModel.find({ ...filter, success: false }).lean().exec(),
      this.auditLogModel.find({ 
        ...filter, 
        action: { $in: ['created', 'updated', 'archived', 'restored'] } 
      }).lean().exec(),
      this.auditLogModel.find({
        ...filter,
        action: { $in: ['verify', 'approve', 'reject', 'assign_admin'] },
      }).lean().exec(),
    ]);

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalChanges: allLogs.length,
        dataModifications: modificationLogs.length,
        administrativeActions: adminLogs.length,
        accessViolations: failedLogs.filter(l => l.statusCode === 403).length,
        failedOperations: failedLogs.length,
      },
      details: allLogs as any,
    };
  }
}