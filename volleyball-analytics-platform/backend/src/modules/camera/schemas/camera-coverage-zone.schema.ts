import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CameraCoverageZoneDocument = CameraCoverageZone & Document;

export enum CoverageZoneType {
  FULL_COURT = 'full_court',
  HALF_COURT = 'half_court',
  NET_ZONE = 'net_zone',
  ATTACK_ZONE = 'attack_zone',
  SERVICE_ZONE = 'service_zone',
  SUBSTITUTION_ZONE = 'substitution_zone',
  LIBERO_ZONE = 'libero_zone',
  COACH_ZONE = 'coach_zone',
  REFEREE_ZONE = 'referee_zone',
  SPECTATOR_ZONE = 'spectator_zone',
  BENCH_ZONE = 'bench_zone',
  WARMUP_ZONE = 'warmup_zone',
  MEDICAL_ZONE = 'medical_zone',
  OFFICIALS_ZONE = 'officials_zone',
  MEDIA_ZONE = 'media_zone',
  VIP_ZONE = 'vip_zone',
  PARKING_ZONE = 'parking_zone',
  ACCESS_ZONE = 'access_zone',
  RESTRICTED_ZONE = 'restricted_zone',
  CUSTOM = 'custom',
}

export enum CoverageQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  NO_COVERAGE = 'no_coverage',
}

export enum ZonePriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Schema({ _id: false })
export class ZoneBoundary {
  @ApiProperty({ type: [Number] })
  @Prop({ type: [Number], required: true })
  coordinates: [number, number, number][];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  coordinateSystem?: string;
}

@Schema({ _id: false })
export class ZoneCamera {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Camera', required: true })
  cameraId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0, max: 100, default: 100 })
  coveragePercentage?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  role?: string;

  @ApiProperty({ required: false })
  @Prop({ type: [String], default: [] })
  coveredFeatures: string[];
}

@Schema({ _id: false })
export class ZoneRequirements {
  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  minCameras?: number;

  @ApiProperty({ required: false })
  @Prop({ type: [String], default: [] })
  requiredModules: string[];

  @ApiProperty({ required: false, enum: ['excellent', 'good', 'fair', 'poor', 'no_coverage'] })
  @Prop({ type: String, enum: ['excellent', 'good', 'fair', 'poor', 'no_coverage'] })
  minQuality?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0, max: 100 })
  minOverlapPercent?: number;

  @ApiProperty({ required: false })
  @Prop({ type: [String], default: [] })
  requiredFeatures: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  customRequirements?: Record<string, any>;
}

@Schema({ _id: false })
export class ZoneCalibration {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  calibrationProfileId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastCalibratedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0, max: 1 })
  calibrationQuality?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  nextCalibrationDue?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  calibratedBy?: string;
}

@Schema({ _id: false })
export class ZoneAnalytics {
  @ApiProperty({ required: false })
  @Prop({ type: Number, default: 0 })
  totalEvents: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, default: 0 })
  uniquePlayers: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, default: 0 })
  totalDurationSeconds: number;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  heatmapData?: Record<string, number>;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  movementPatterns?: Record<string, any>;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  eventDistribution?: Record<string, number>;
}

@Schema({ _id: false })
export class CoverageZoneAuditInfo {
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
export class CoverageZoneArchive {
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
  collection: 'camera_coverage_zones',
  timestamps: true,
  versionKey: 'version',
})
export class CameraCoverageZone {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  zoneId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Court' })
  courtId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  code?: string;

  @ApiProperty({ enum: [
    'full_court', 'half_court', 'net_zone', 'attack_zone', 'service_zone',
    'substitution_zone', 'libero_zone', 'coach_zone', 'referee_zone',
    'spectator_zone', 'bench_zone', 'warmup_zone', 'medical_zone',
    'officials_zone', 'media_zone', 'vip_zone', 'parking_zone',
    'access_zone', 'restricted_zone', 'custom'
  ] })
  @Prop({ type: String, enum: [
    'full_court', 'half_court', 'net_zone', 'attack_zone', 'service_zone',
    'substitution_zone', 'libero_zone', 'coach_zone', 'referee_zone',
    'spectator_zone', 'bench_zone', 'warmup_zone', 'medical_zone',
    'officials_zone', 'media_zone', 'vip_zone', 'parking_zone',
    'access_zone', 'restricted_zone', 'custom'
  ], required: true, index: true })
  type: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty()
  @Prop({ type: Object, required: true })
  boundary: any;

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  cameras: any[];

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  requirements: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  calibration?: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  analytics?: any;

  @ApiProperty({ enum: ['excellent', 'good', 'fair', 'poor', 'no_coverage'] })
  @Prop({ type: String, enum: ['excellent', 'good', 'fair', 'poor', 'no_coverage'], required: true, default: 'no_coverage', index: true })
  quality: string;

  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] })
  @Prop({ type: String, enum: ['critical', 'high', 'medium', 'low'], required: true, default: 'medium', index: true })
  priority: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  tags: string[];

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  audit: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  archive: any;

  @ApiProperty({ type: Object, default: {} })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const CameraCoverageZoneSchema = SchemaFactory.createForClass(CameraCoverageZone);

// Indexes
CameraCoverageZoneSchema.index({ zoneId: 1 }, { unique: true });
CameraCoverageZoneSchema.index({ venueId: 1, type: 1 });
CameraCoverageZoneSchema.index({ courtId: 1 });
CameraCoverageZoneSchema.index({ type: 1, quality: 1 });
CameraCoverageZoneSchema.index({ priority: 1 });
CameraCoverageZoneSchema.index({ 'boundary.coordinates': '2dsphere' });

// Virtual for isWellCovered
CameraCoverageZoneSchema.virtual('isWellCovered').get(function() {
  return this.quality === 'excellent' || this.quality === 'good';
});

// Virtual for cameraCount
CameraCoverageZoneSchema.virtual('cameraCount').get(function() {
  return this.cameras?.length || 0;
});

// Virtual for isCritical
CameraCoverageZoneSchema.virtual('isCritical').get(function() {
  return this.priority === 'critical';
});