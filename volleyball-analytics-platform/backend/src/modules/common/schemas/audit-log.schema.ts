/**
 * Audit Log Schema - Chapter 12 Part 1
 * 
 * Immutable audit log for all entity operations
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
  VERIFY = 'verify',
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
}

export enum AuditResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

@Schema({ _id: false })
export class AuditContext {
  @ApiProperty()
  @Prop({ type: String, required: true })
  ipAddress: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  userAgent: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  device?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  browser?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  operatingSystem?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  correlationId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  requestId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  endpoint?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  method?: string;
}

@Schema({ 
  collection: 'audit_logs',
  timestamps: true,
  versionKey: false,
})
export class AuditLog {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  auditId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  userRole: string;

  @ApiProperty({ enum: AuditAction })
  @Prop({ type: String, enum: AuditAction, required: true, index: true })
  action: AuditAction;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  entityType: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, required: true, index: true })
  entityId: Types.ObjectId;

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  oldValues?: Record<string, any>;

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  newValues?: Record<string, any>;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  changedFields: string[];

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  tenantId: string;

  @ApiProperty({ enum: AuditResult })
  @Prop({ type: String, enum: AuditResult, required: true, default: AuditResult.SUCCESS })
  result: AuditResult;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  errorMessage?: string;

  @ApiProperty({ type: AuditContext })
  @Prop({ type: AuditContext, required: true })
  context: AuditContext;

  @ApiProperty()
  @Prop({ type: Date, required: true, default: Date.now, index: true })
  timestamp: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  remarks?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes for common queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ organizationId: 1, timestamp: -1 });
AuditLogSchema.index({ tenantId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ result: 1, timestamp: -1 });
AuditLogSchema.index({ correlationId: 1 });
AuditLogSchema.index({ 'context.requestId': 1 });

// Make audit logs immutable
AuditLogSchema.pre('findOneAndUpdate', function() {
  throw new Error('Audit logs are immutable and cannot be updated');
});

AuditLogSchema.pre('updateOne', function() {
  throw new Error('Audit logs are immutable and cannot be updated');
});

AuditLogSchema.pre('updateMany', function() {
  throw new Error('Audit logs are immutable and cannot be updated');
});

AuditLogSchema.pre('deleteOne', function() {
  throw new Error('Audit logs are immutable and cannot be deleted');
});

AuditLogSchema.pre('deleteMany', function() {
  throw new Error('Audit logs are immutable and cannot be deleted');
});