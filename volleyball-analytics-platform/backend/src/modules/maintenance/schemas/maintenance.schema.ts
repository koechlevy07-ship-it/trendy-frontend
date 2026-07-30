import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MaintenanceDocument = Maintenance & Document;

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  PREDICTIVE = 'predictive',
  EMERGENCY = 'emergency',
  INSPECTION = 'inspection',
  CALIBRATION = 'calibration',
  CLEANING = 'cleaning',
  LUBRICATION = 'lubrication',
  REPLACEMENT = 'replacement',
  UPGRADE = 'upgrade',
  TESTING = 'testing',
  TRAINING = 'training',
  OTHER = 'other',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
  OVERDUE = 'overdue',
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum MaintenanceTrigger {
  TIME_BASED = 'time_based',
  USAGE_BASED = 'usage_based',
  CONDITION_BASED = 'condition_based',
  MANUAL = 'manual',
  EVENT_TRIGGERED = 'event_triggered',
}

@Schema({ _id: false })
export class MaintenanceAssignment {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  assignedTo?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  assignedToName?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  assignedToEmail?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  assignedToPhone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  supervisorId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  team?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  departmentId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  assignedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  acknowledgedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  acknowledged: boolean;
}

@Schema({ _id: false })
export class MaintenanceParts {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  partNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  partName?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  quantity?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  unit?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  costPerUnit?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  totalCost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  supplier?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  partNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;
}

@Schema({ _id: false })
export class MaintenanceChecklist {
  @ApiProperty()
  @Prop({ type: String, required: true })
  step: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  completedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  completedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  order: number;
}

@Schema({ _id: false })
export class MaintenanceDocument {
  @ApiProperty()
  @Prop({ type: String, required: true })
  documentId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  fileUrl: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  mimeType: string;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  fileSize: number;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  uploadedAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  uploadedBy?: Types.ObjectId;
}

@Schema({ _id: false })
export class MaintenanceAudit {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  version: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  auditReference?: string;
}

@Schema({ _id: false })
export class MaintenanceArchive {
  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false, index: true })
  isArchived: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  archivedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  archivedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  archiveReason?: string;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  snapshot?: Record<string, any>;
}

@Schema({ 
  collection: 'maintenance_schedules',
  timestamps: true,
  versionKey: 'version',
})
export class Maintenance {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  maintenanceId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Court' })
  courtId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Equipment' })
  equipmentId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Sensor' })
  sensorId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ enum: ['preventive', 'corrective', 'predictive', 'emergency', 'inspection', 'calibration', 'cleaning', 'lubrication', 'replacement', 'upgrade', 'testing', 'training', 'other'] })
  @Prop({ type: String, enum: ['preventive', 'corrective', 'predictive', 'emergency', 'inspection', 'calibration', 'cleaning', 'lubrication', 'replacement', 'upgrade', 'testing', 'training', 'other'], required: true, index: true })
  type: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'] })
  @Prop({ type: String, enum: ['low', 'medium', 'high', 'critical'], required: true, default: 'medium', index: true })
  priority: string;

  @ApiProperty({ enum: ['time_based', 'usage_based', 'condition_based', 'manual', 'event_triggered'] })
  @Prop({ type: String, enum: ['time_based', 'usage_based', 'condition_based', 'manual', 'event_triggered'], required: true, default: 'time_based' })
  triggerType: string;

  @ApiProperty({ enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold', 'overdue'] })
  @Prop({ type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold', 'overdue'], required: true, default: 'scheduled', index: true })
  status: string;

  @ApiProperty({ enum: ['time_based', 'usage_based', 'condition_based', 'manual', 'event_triggered'] })
  @Prop({ type: String, enum: ['time_based', 'usage_based', 'condition_based', 'manual', 'event_triggered'], required: true, default: 'time_based' })
  triggerType: string;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  scheduledDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  estimatedStartTime?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  estimatedEndTime?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  actualStartTime?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  actualEndTime?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Number, default: 0 })
  durationMinutes?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, default: 0 })
  estimatedDurationMinutes?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  frequency?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  nextOccurrence?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastOccurrence?: Date;

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  parts: any[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  checklist: any[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  documents: any[];

  @ApiProperty({ type: Object, required: true })
  @Prop({ type: Object, required: true })
  assignment: any;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  completionNotes?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  actualDurationMinutes?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  totalCost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  completedBy?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  completedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  completionData?: any;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  cancelledBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  cancellationReason?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  cancelledAt?: Date;

  @ApiProperty({ type: Object, default: {} })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty({ type: Object, default: {} })
  @Prop({ type: Object, default: {} })
  audit: any;

  @ApiProperty({ type: Object, default: {} })
  @Prop({ type: Object, default: {} })
  archive: any;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  parentMaintenanceId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  isRecurring: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  recurrenceRule?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  recurrenceEndDate?: Date;
}

export const MaintenanceSchema = SchemaFactory.createForClass(Maintenance);

// Indexes
MaintenanceSchema.index({ maintenanceId: 1 }, { unique: true });
MaintenanceSchema.index({ venueId: 1, status: 1 });
MaintenanceSchema.index({ courtId: 1, status: 1 });
MaintenanceSchema.index({ equipmentId: 1, status: 1 });
MaintenanceSchema.index({ sensorId: 1, status: 1 });
MaintenanceSchema.index({ scheduledDate: 1, status: 1 });
MaintenanceSchema.index({ status: 1 });
MaintenanceSchema.index({ 'assignment.assignedTo': 1, status: 1 });
MaintenanceSchema.index({ scheduledDate: 1, status: 1 });
MaintenanceSchema.index({ priority: 1, scheduledDate: 1 });
MaintenanceSchema.index({ type: 1, status: 1 });
MaintenanceSchema.index({ venueId: 1, type: 1, status: 1 });

// Virtual for isOverdue
MaintenanceSchema.virtual('isOverdue').get(function() {
  return this.status === 'scheduled' && this.scheduledDate < new Date();
});

// Virtual for isDueSoon
MaintenanceSchema.virtual('isDueSoon').get(function() {
  if (this.status !== 'scheduled') return false;
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return this.scheduledDate >= now && this.scheduledDate <= in24Hours;
});

// Virtual for isInProgress
MaintenanceSchema.virtual('isInProgress').get(function() {
  return this.status === 'in_progress';
});