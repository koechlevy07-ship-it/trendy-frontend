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
  INSPECTION = 'inspection',
  TESTING = 'testing',
  UPGRADE = 'upgrade',
  MODIFICATION = 'modification',
  CLEANING = 'cleaning',
  LUBRICATION = 'lubrication',
  ADJUSTMENT = 'adjustment',
  ALIGNMENT = 'alignment',
  CALIBRATION = 'calibration',
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
  ON_HOLD = 'on_hold',
  OVERDUE = 'overdue',
}

export enum MaintenanceTrigger {
  TIME_BASED = 'time_based',
  CONDITION_BASED = 'condition_based',
  EVENT_BASED = 'event_based',
  MANUAL = 'manual',
  PREDICTIVE = 'predictive',
}

@Schema({ _id: false })
export class MaintenanceChecklist {
  @ApiProperty()
  @Prop({ type: String, required: true })
  item: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  completedBy?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  completedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  required: boolean;
}

@Schema({ _id: false })
export class MaintenanceParts {
  @ApiProperty()
  @Prop({ type: String, required: true })
  partName: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  partNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  quantity?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  unit?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  cost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  used: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  supplier?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;
}

@Schema({ _id: false })
export class MaintenancePersonnel {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  name?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  role?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  isLead: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  startTime?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  endTime?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  durationMinutes?: number;
}

@Schema({ _id: false })
export class MaintenanceCost {
  @ApiProperty({ required: false })
  @Prop({ type: Number })
  laborCost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  partsCost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  materialCost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  externalServiceCost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  travelCost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  otherCost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  totalCost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  currency?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  invoiceNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  invoiceDate?: Date;
}

@Schema({ _id: false })
export class MaintenanceFindings {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  condition?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  rootCause?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  recommendation?: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  observations: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  severity?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  riskLevel?: string;

  @ApiProperty({ required: false, type: [String] })
  @Prop({ type: [String], default: [] })
  recommendations: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  nextSteps?: string;
}

@Schema({ _id: false })
export class MaintenanceAudit {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  completedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  approvedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  cancelledBy?: Types.ObjectId;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  version: number;
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
  @Prop({ type: Types.ObjectId, ref: 'Facility' })
  facilityId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Sensor' })
  sensorId?: Types.ObjectId;

  @ApiProperty({ enum: ['preventive', 'corrective', 'predictive', 'emergency', 'inspection', 'calibration', 'cleaning', 'lubrication', 'replacement', 'inspection', 'testing', 'upgrade', 'modification', 'cleaning', 'lubrication', 'adjustment', 'alignment', 'calibration'] })
  @Prop({ type: String, enum: ['preventive', 'corrective', 'predictive', 'emergency', 'inspection', 'calibration', 'cleaning', 'lubrication', 'replacement', 'inspection', 'testing', 'upgrade', 'modification', 'cleaning', 'lubrication', 'adjustment', 'alignment', 'calibration'], required: true, index: true })
  type: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical', 'emergency'] })
  @Prop({ type: String, enum: ['low', 'medium', 'high', 'critical', 'emergency'], required: true, default: 'medium', index: true })
  priority: string;

  @ApiProperty({ enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed', 'on_hold', 'overdue'] })
  @Prop({ type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed', 'on_hold', 'overdue'], required: true, default: 'scheduled', index: true })
  status: string;

  @ApiProperty({ enum: ['time_based', 'condition_based', 'event_based', 'manual', 'predictive'] })
  @Prop({ type: String, enum: ['time_based', 'condition_based', 'event_based', 'manual', 'predictive'], required: true })
  trigger: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  detailedDescription?: string;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  scheduledDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  estimatedEndDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  actualStartDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  actualEndDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  estimatedDurationMinutes?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  actualDurationMinutes?: number;

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  checklist: any[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  parts: any[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  personnel: any[];

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  cost?: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  findings?: any;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  workOrderNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  purchaseOrderNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  vendor?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  contractNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  permitNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  safetyRequirements?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  ppeRequired?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  lockoutTagout?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  permitsRequired?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  shutdownRequired?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  estimatedDowntime?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  actualDowntime?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  downtimeReason?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  rootCause?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  correctiveAction?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  preventiveAction?: string;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  audit: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  archive: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const MaintenanceSchema = SchemaFactory.createForClass(Maintenance);

// Indexes
MaintenanceSchema.index({ maintenanceId: 1 }, { unique: true });
MaintenanceSchema.index({ venueId: 1, status: 1 });
MaintenanceSchema.index({ courtId: 1, status: 1 });
MaintenanceSchema.index({ equipmentId: 1, status: 1 });
MaintenanceSchema.index({ scheduledDate: 1, status: 1 });
MaintenanceSchema.index({ status: 1, priority: 1 });
MaintenanceSchema.index({ type: 1, status: 1 });
MaintenanceSchema.index({ scheduledDate: 1 });
MaintenanceSchema.index({ 'personnel.userId': 1, status: 1 });
MaintenanceSchema.index({ 'cost.totalCost': 1 });

// Virtual for isOverdue
MaintenanceSchema.virtual('isOverdue').get(function() {
  if (this.status === 'scheduled' && this.scheduledDate < new Date()) {
    return true;
  }
  return false;
});

// Virtual for isOverdue
MaintenanceSchema.virtual('isDueSoon').get(function() {
  if (this.status === 'scheduled') {
    const soon = new Date();
    soon.setHours(soon.getHours() + 24);
    return this.scheduledDate <= soon;
  }
  return false;
});

// Virtual for duration
MaintenanceSchema.virtual('duration').get(function() {
  if (this.actualStartDate && this.actualEndDate) {
    return this.actualEndDate.getTime() - this.actualStartDate.getTime();
  }
  return null;
});

// Virtual for costVariance
MaintenanceSchema.virtual('costVariance').get(function() {
  if (this.cost && this.cost.estimatedCost && this.cost.actualCost) {
    return this.cost.actualCost - this.cost.estimatedCost;
  }
  return null;
});