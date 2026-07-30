import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VenueAuditLogDocument = VenueAuditLog & Document;

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
  VERIFY = 'verify',
  APPROVE = 'approve',
  REJECT = 'reject',
  ACTIVATE = 'activate',
  SUSPEND = 'suspend',
  DECOMMISSION = 'decommission',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
  TRANSFER = 'transfer',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  SHARE = 'share',
  VIEW = 'view',
  PRINT = 'print',
  EXPORT = 'export',
  IMPORT = 'import',
  LOGIN = 'login',
  LOGOUT = 'logout',
  FAILED_LOGIN = 'failed_login',
  PERMISSION_CHANGE = 'permission_change',
  ROLE_CHANGE = 'role_change',
  CONFIGURATION_CHANGE = 'configuration_change',
  CALIBRATION = 'calibration',
  MAINTENANCE = 'maintenance',
  INSPECTION = 'inspection',
  CERTIFICATION = 'certification',
  SCHEDULE = 'schedule',
  CANCEL = 'cancel',
  COMPLETE = 'complete',
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
  FINISH = 'finish',
}

export enum EntityType {
  VENUE = 'venue',
  COURT = 'court',
  FIXTURE = 'fixture',
  MATCH = 'match',
  TEAM = 'team',
  PLAYER = 'player',
  OFFICIAL = 'official',
  FACILITY = 'facility',
  EQUIPMENT = 'equipment',
  CAMERA = 'camera',
  SENSOR = 'sensor',
  CALIBRATION = 'calibration',
  CERTIFICATION = 'certification',
  DOCUMENT = 'document',
  MEDIA = 'media',
  FIXTURE = 'fixture',
  MATCH = 'match',
  SEASON = 'season',
  COMPETITION = 'competition',
  ORGANIZATION = 'organization',
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  SETTING = 'setting',
  CONFIGURATION = 'configuration',
  REPORT = 'report',
  ANALYTICS = 'analytics',
  AUDIT = 'audit',
  NOTIFICATION = 'notification',
  MESSAGE = 'message',
  ALERT = 'alert',
  TASK = 'task',
  WORKFLOW = 'workflow',
  SCHEDULE = 'schedule',
  CALENDAR = 'calendar',
  INVITATION = 'invitation',
  REGISTRATION = 'registration',
  PAYMENT = 'payment',
  INVOICE = 'invoice',
  SUBSCRIPTION = 'subscription',
  LICENSE = 'license',
  CONTRACT = 'contract',
  AGREEMENT = 'agreement',
  OTHER = 'other',
}

export enum AuditResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL = 'partial',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

@Schema({ _id: false })
export class AuditContext {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  ipAddress?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  userAgent?: string;

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

@Schema({ _id: false })
export class AuditChanges {
  @ApiProperty({ type: Object, required: false })
  @Prop({ type: Object })
  oldValues?: Record<string, any>;

  @ApiProperty({ type: Object, required: false })
  @Prop({ type: Object })
  newValues?: Record<string, any>;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  changedFields: string[];

  @ApiProperty({ type: Object, required: false })
  @Prop({ type: Object })
  delta?: Record<string, any>;
}

@Schema({
  collection: 'venue_audit_logs',
  timestamps: true,
  versionKey: false,
})
export class VenueAuditLog {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  auditId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String, index: true })
  userRole?: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  organizationId: string;

  @ApiProperty({ enum: AuditAction })
  @Prop({ type: String, enum: AuditAction, required: true, index: true })
  action: AuditAction;

  @ApiProperty({ enum: EntityType })
  @Prop({ type: String, enum: EntityType, required: true, index: true })
  entityType: EntityType;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, required: true, index: true })
  entityId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  entityName?: string;

  @ApiProperty({ type: AuditChanges, required: true })
  @Prop({ type: AuditChanges, required: true })
  changes: AuditChanges;

  @ApiProperty({ enum: AuditResult })
  @Prop({ type: String, enum: AuditResult, required: true, default: AuditResult.SUCCESS, index: true })
  result: AuditResult;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  errorMessage?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  errorCode?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  errorDetails?: Record<string, any>;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  durationMs?: number;

  @ApiProperty({ type: AuditContext, required: true })
  @Prop({ type: AuditContext, required: true })
  context: AuditContext;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  correlationId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  sessionId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  requestId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  endpoint?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  httpMethod?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  statusCode?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  userAgent?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  ipAddress?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  deviceFingerprint?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  geoLocation?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  correlationGroup?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  traceId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  spanId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  parentSpanId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  tags?: Record<string, any>;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  remarks?: string;

  @ApiProperty()
  @Prop({ type: Date, required: true, default: Date.now, index: true })
  timestamp: Date;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const VenueAuditLogSchema = SchemaFactory.createForClass(VenueAuditLog);

// Indexes
VenueAuditLogSchema.index({ auditId: 1 }, { unique: true });
VenueAuditLogSchema.index({ userId: 1, timestamp: -1 });
VenueAuditLogSchema.index({ organizationId: 1, timestamp: -1 });
VenueAuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
VenueAuditLogSchema.index({ action: 1, timestamp: -1 });
VenueAuditLogSchema.index({ result: 1, timestamp: -1 });
VenueAuditLogSchema.index({ correlationId: 1 });
VenueAuditLogSchema.index({ sessionId: 1 });
VenueAuditLogSchema.index({ timestamp: -1 });
VenueAuditLogSchema.index({ 'context.ipAddress': 1 });
VenueAuditLogSchema.index({ 'context.userAgent': 1 });

// Compound indexes for common queries
VenueAuditLogSchema.index({ organizationId: 1, action: 1, timestamp: -1 });
VenueAuditLogSchema.index({ organizationId: 1, entityType: 1, timestamp: -1 });
VenueAuditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });
VenueAuditLogSchema.index({ entityType: 1, action: 1, timestamp: -1 });
VenueAuditLogSchema.index({ organizationId: 1, timestamp: -1, result: 1 });
VenueAuditLogSchema.index({ entityType: 1, entityId: 1, action: 1, timestamp: -1 });

// TTL index for automatic cleanup (optional - 7 years retention)
VenueAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 365 * 24 * 60 * 60 });

// Virtual for isSuccess
VenueAuditLogSchema.virtual('isSuccess').get(function() {
  return this.result === 'success';
});

// Virtual for isFailure
VenueAuditLogSchema.virtual('isFailure').get(function() {
  return this.result === 'failure';
});

// Virtual for hasChanges
VenueAuditLogSchema.virtual('hasChanges').get(function() {
  return this.changes.changedFields && this.changes.changedFields.length > 0;
});

// Virtual for changeCount
VenueAuditLogSchema.virtual('changeCount').get(function() {
  return this.changes.changedFields?.length || 0;
});