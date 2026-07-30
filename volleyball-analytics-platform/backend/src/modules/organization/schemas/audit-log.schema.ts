/**
 * Audit Log Schema - Chapter 11 Part 4
 * 
 * Immutable audit log schema for organizational operations.
 * Supports compliance, governance, and forensic investigations.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationAuditLogDocument = OrganizationAuditLog & Document;

@Schema({ 
  collection: 'organization_audit_logs',
  timestamps: true,
  // Immutable - prevent updates after creation
  versionKey: false,
})
export class OrganizationAuditLog {
  @Prop({ required: true, unique: true, index: true })
  auditId: string;

  @Prop({ required: true, index: true })
  correlationId: string;

  @Prop({ index: true })
  userId?: string;

  @Prop()
  userRole?: string;

  @Prop({ index: true })
  organizationId?: string;

  @Prop({ required: true, index: true })
  tenantId: string;

  @Prop({ required: true, index: true })
  action: string;

  @Prop({ required: true, index: true })
  entityType: string;

  @Prop({ index: true })
  entityId?: string;

  @Prop({ type: Object })
  oldValues?: Record<string, any>;

  @Prop({ type: Object })
  newValues?: Record<string, any>;

  @Prop({ type: [String] })
  changedFields?: string[];

  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true })
  success: boolean;

  @Prop({ required: true })
  duration: number; // milliseconds

  @Prop({ required: true })
  ipAddress: string;

  @Prop()
  device?: string;

  @Prop()
  userAgent?: string;

  @Prop({ index: true })
  requestId?: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ required: true })
  method: string;

  @Prop()
  errorMessage?: string;

  @Prop({ required: true, enum: ['success', 'failure'] })
  result: 'success' | 'failure';

  @Prop({ required: true, default: Date.now, index: true })
  timestamp: Date;

  @Prop({ default: true, immutable: true })
  immutable: boolean;

  // Indexes for common queries
  static get indexes() {
    return [
      { tenantId: 1, timestamp: -1 },
      { organizationId: 1, timestamp: -1 },
      { userId: 1, timestamp: -1 },
      { correlationId: 1 },
      { entityType: 1, entityId: 1, timestamp: -1 },
      { action: 1, timestamp: -1 },
      { success: 1, timestamp: -1 },
      { 'result': 1, timestamp: -1 },
    ];
  }
}

export const OrganizationAuditLogSchema = SchemaFactory.createForClass(OrganizationAuditLog);

// Apply indexes
OrganizationAuditLogSchema.indexes().forEach(index => {
  OrganizationAuditLogSchema.index(index);
});

// Make audit logs truly immutable - prevent updates
OrganizationAuditLogSchema.pre('findOneAndUpdate', function(next) {
  throw new Error('Audit logs are immutable and cannot be updated');
});

OrganizationAuditLogSchema.pre('updateOne', function(next) {
  throw new Error('Audit logs are immutable and cannot be updated');
});

OrganizationAuditLogSchema.pre('updateMany', function(next) {
  throw new Error('Audit logs are immutable and cannot be updated');
});

OrganizationAuditLogSchema.pre('deleteOne', function(next) {
  throw new Error('Audit logs are immutable and cannot be deleted');
});

OrganizationAuditLogSchema.pre('deleteMany', function(next) {
  throw new Error('Audit logs are immutable and cannot be deleted');
});