import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type EquipmentDocument = Equipment & Document;

export enum EquipmentType {
  NET_SYSTEM = 'net_system',
  POST_SYSTEM = 'post_system',
  SCOREBOARD = 'scoreboard',
  LINE_JUDGE_CHAIR = 'line_judge_chair',
  REFEREE_STAND = 'referee_stand',
  SPECTATOR_STAND = 'spectator_stand',
  TEAM_BENCH = 'team_bench',
  OFFICIALS_TABLE = 'officials_table',
  SERVICE_ZONE_MARKER = 'service_zone_marker',
  ATTACK_LINE_MARKER = 'attack_line_marker',
  CENTER_LINE_MARKER = 'center_line_marker',
  SUBSTITUTION_ZONE = 'substitution_zone',
  LIBERO_ZONE = 'libero_zone',
  COACH_RESTRICTION_LINE = 'coach_restriction_line',
  WARMUP_AREA_EQUIPMENT = 'warmup_area_equipment',
  MEDICAL_EQUIPMENT = 'medical_equipment',
  TRAINING_AIDS = 'training_aids',
  VIDEO_REPLAY_SYSTEM = 'video_replay_system',
  CHALLENGE_SYSTEM = 'challenge_system',
  STATISTICS_SYSTEM = 'statistics_system',
  SOUND_SYSTEM = 'sound_system',
  LIGHTING_SYSTEM = 'lighting_system',
  HVAC = 'hvac',
  POWER_DISTRIBUTION = 'power_distribution',
  WATER_SYSTEM = 'water_system',
  FIRE_SAFETY = 'fire_safety',
  SECURITY_SYSTEM = 'security_system',
  CAMERA_SYSTEM = 'camera_system',
  SENSOR_SYSTEM = 'sensor_system',
  NETWORK_INFRASTRUCTURE = 'network_infrastructure',
  OTHER = 'other',
}

export enum EquipmentStatus {
  OPERATIONAL = 'operational',
  IN_MAINTENANCE = 'in_maintenance',
  NEEDS_REPAIR = 'needs_repair',
  NEEDS_REPLACEMENT = 'needs_replacement',
  DECOMMISSIONED = 'decommissioned',
  IN_STORAGE = 'in_storage',
  LOST = 'lost',
  STOLEN = 'stolen',
  DAMAGED = 'damaged',
  CALIBRATION = 'calibration',
  TESTING = 'testing',
  ARCHIVED = 'archived',
}

export enum EquipmentCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical',
}

export enum MaintenanceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  AS_NEEDED = 'as_needed',
}

@Schema({ _id: false })
export class EquipmentLocation {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  venueId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  courtId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  building?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  floor?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  room?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  zone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  specificLocation?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  coordinates?: {
    x: number;
    y: number;
    z: number;
  };
}

@Schema({ _id: false })
export class EquipmentManufacturer {
  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  model?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  serialNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  contactPerson?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  contactPhone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  contactEmail?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  website?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  supportPhone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  supportEmail?: string;
}

@Schema({ _id: false })
export class WarrantyInfo {
  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  hasWarranty: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  warrantyStartDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  warrantyEndDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  warrantyProvider?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  warrantyNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  warrantyTerms?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  extendedWarrantyProvider?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  extendedWarrantyEndDate?: Date;
}

@Schema({ _id: false })
export class MaintenanceHistory {
  @ApiProperty()
  @Prop({ type: Date, required: true })
  date: Date;

  @ApiProperty()
  @Prop({ type: String, required: true })
  type: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  performedBy?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  technicianId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  cost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  outcome?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  partsReplaced?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  durationMinutes?: number;
}

@Schema({ _id: false })
export class EquipmentSpecifications {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  dimensions?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  weight?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  powerRequirements?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  voltage?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  powerConsumption?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  operatingTemperatureRange?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  humidityRange?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  certifications?: string;

  @ApiProperty({ required: false })
  @Prop({ type: [String], default: [] })
  standards?: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  ipRating?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  material?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  customSpecs?: Record<string, any>;
}

@Schema({ _id: false })
export class EquipmentWarranty {
  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  hasWarranty: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  warrantyStartDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  warrantyEndDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  warrantyProvider?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  warrantyNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  warrantyTerms?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  extendedWarrantyProvider?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  extendedWarrantyEndDate?: Date;
}

@Schema({ _id: false })
export class EquipmentAuditInfo {
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
export class EquipmentArchive {
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
  collection: 'equipment_inventory',
  timestamps: true,
  versionKey: 'version',
})
export class Equipment {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  equipmentId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Court' })
  courtId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  equipmentName: string;

  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  equipmentCode: string;

  @ApiProperty({ enum: EquipmentType })
  @Prop({ type: String, enum: EquipmentType, required: true, index: true })
  equipmentType: EquipmentType;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ enum: EquipmentStatus })
  @Prop({ type: String, enum: EquipmentStatus, required: true, default: EquipmentStatus.OPERATIONAL, index: true })
  status: EquipmentStatus;

  @ApiProperty({ enum: EquipmentCondition })
  @Prop({ type: String, enum: EquipmentCondition, required: true, default: EquipmentCondition.GOOD })
  condition: EquipmentCondition;

  @ApiProperty({ type: EquipmentLocation })
  @Prop({ type: EquipmentLocation, required: true })
  location: EquipmentLocation;

  @ApiProperty({ type: EquipmentManufacturer })
  @Prop({ type: EquipmentManufacturer, required: true })
  manufacturer: EquipmentManufacturer;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  model?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  serialNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  purchaseDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  purchaseCost?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  currency?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  assetTag?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  installationDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  commissioningDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  decommissioningDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  assetNumber?: string;

  @ApiProperty({ type: EquipmentSpecifications })
  @Prop({ type: EquipmentSpecifications, required: true })
  specifications: EquipmentSpecifications;

  @ApiProperty({ type: EquipmentWarranty })
  @Prop({ type: EquipmentWarranty, required: true })
  warranty: EquipmentWarranty;

  @ApiProperty({ type: [MaintenanceHistory], default: [] })
  @Prop({ type: [MaintenanceHistory], default: [] })
  maintenanceHistory: MaintenanceHistory[];

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastMaintenanceDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  nextMaintenanceDate?: Date;

  @ApiProperty({ enum: ['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual', 'as_needed'] })
  @Prop({ type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual', 'as_needed'], required: true, default: 'monthly' })
  maintenanceFrequency: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  maintenanceContractId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  serviceProvider?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  serviceContractNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  serviceContractExpiry?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  assignedTo?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  assignedToName?: string;

  @ApiProperty({ type: EquipmentSpecifications })
  @Prop({ type: EquipmentSpecifications, required: true })
  specifications: EquipmentSpecifications;

  @ApiProperty({ type: EquipmentWarranty })
  @Prop({ type: EquipmentWarranty, required: true })
  warranty: EquipmentWarranty;

  @ApiProperty({ type: EquipmentAuditInfo })
  @Prop({ type: EquipmentAuditInfo, required: true })
  audit: EquipmentAuditInfo;

  @ApiProperty({ type: EquipmentArchive })
  @Prop({ type: EquipmentArchive, required: true })
  archive: EquipmentArchive;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);

// Indexes
EquipmentSchema.index({ equipmentId: 1 }, { unique: true });
EquipmentSchema.index({ equipmentCode: 1 }, { unique: true });
EquipmentSchema.index({ venueId: 1, equipmentType: 1 });
EquipmentSchema.index({ venueId: 1, status: 1 });
EquipmentSchema.index({ courtId: 1, status: 1 });
EquipmentSchema.index({ equipmentType: 1, status: 1 });
EquipmentSchema.index({ equipmentCode: 1 }, { unique: true });
EquipmentSchema.index({ serialNumber: 1 });
EquipmentSchema.index({ assetTag: 1 });
EquipmentSchema.index({ 'location.venueId': 1, 'location.courtId': 1 });
EquipmentSchema.index({ nextMaintenanceDate: 1, status: 1 });
EquipmentSchema.index({ 'warranty.warrantyEndDate': 1 });

// Virtual for isUnderWarranty
EquipmentSchema.virtual('isUnderWarranty').get(function() {
  if (!this.warranty.hasWarranty) return false;
  if (!this.warranty.warrantyEndDate) return true;
  return this.warranty.warrantyEndDate > new Date();
});

// Virtual for isWarrantyExpiringSoon
EquipmentSchema.virtual('isWarrantyExpiringSoon').get(function() {
  if (!this.warranty.hasWarranty || !this.warranty.warrantyEndDate) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.warranty.warrantyEndDate <= thirtyDaysFromNow;
});

// Virtual for needsMaintenance
EquipmentSchema.virtual('needsMaintenance').get(function() {
  if (!this.nextMaintenanceDate) return false;
  return this.nextMaintenanceDate <= new Date();
});

// Virtual for isOperational
EquipmentSchema.virtual('isOperational').get(function() {
  return this.status === EquipmentStatus.OPERATIONAL;
});