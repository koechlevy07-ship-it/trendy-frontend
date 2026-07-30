import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CourtLayoutDocument = CourtLayout & Document;

export enum CourtLayoutType {
  STANDARD = 'standard',
  COMPETITION = 'competition',
  TRAINING = 'training',
  WARMUP = 'warmup',
  PRACTICE = 'practice',
  BEACH = 'beach',
  SITTING = 'sitting',
  CUSTOM = 'custom',
}

export enum CourtLayoutStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated',
}

@Schema({ _id: false })
export class CourtLayoutDimensions {
  @ApiProperty()
  @Prop({ type: Number, required: true, min: 10, max: 30 })
  length: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 5, max: 20 })
  width: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  height?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  freeZoneWidth?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  freeZoneLength?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  freeHeight?: number;

  @ApiProperty({ enum: ['north_south', 'east_west', 'northeast_southwest', 'northwest_southeast'] })
  @Prop({ type: String, enum: ['north_south', 'east_west', 'northeast_southwest', 'northwest_southeast'], required: true })
  orientation: string;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  hasRaisedPlatform?: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  platformHeight?: number;
}

@Schema({ _id: false })
export class CourtLayoutNet {
  @ApiProperty({ enum: ['indoor', 'beach', 'sitting', 'training', 'competition'] })
  @Prop({ type: String, enum: ['indoor', 'beach', 'sitting', 'training', 'competition'], required: true })
  type: string;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 2.0, max: 3.0 })
  height: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  netMaterial?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  netColor?: string;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  hasAntennae: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  antennaHeight?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  sideBandsColor?: string;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  hasSideBands: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  netSystem?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  tensionSystem?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  tensionForce?: number;
}

@Schema({ _id: false })
export class CourtLayoutMarkings {
  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  boundaryLines: boolean;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  attackLines: boolean;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  centerLine: boolean;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  serviceZones: boolean;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  substitutionZones: boolean;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  liberoReplacementZone: boolean;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  coachRestrictionLine: boolean.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  lineColor?: string;

  @ApiProperty({ required: false, minimum: 1, maximum: 10, default: 5 })
  @Prop({ type: Number, min: 1, max: 10, default: 5 })
  lineWidth?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  lineMaterial?: string;
}

@Schema({ _id: false })
export class CourtLayoutSafetyZone {
  @ApiProperty({ enum: ['free', 'obstruction', 'penalty', 'service', 'end_line', 'side_line', 'attack_line', 'center_line'] })
  @Prop({ type: String, enum: ['free', 'obstruction', 'penalty', 'service', 'end_line', 'side_line', 'attack_line', 'center_line'], required: true })
  type: string;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 0, max: 10 })
  width: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0, max: 10 })
  length?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  surface?: string;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isObstructed: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  obstructionDetails?: string;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  isCompliant: boolean;
}

@Schema({ _id: false })
export class CourtLayoutEquipment {
  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  hasRefereeStand: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  refereeStandType?: string;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  hasScoreboard: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  scoreboardType?: string;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  hasVideoReplay: boolean.

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  hasChallengeSystem: boolean.

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  hasTeamBenches: boolean;

  @ApiProperty({ default: 14 })
  @Prop({ type: Number, min: 0, default: 14 })
  benchCapacity: number.

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  hasWarmupArea: boolean.

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  hasMedicalArea: boolean.

  @ApiProperty({ required: false, type: [String] })
  @Prop({ type: [String], default: [] })
  additionalEquipment: string[].
}

@Schema({ _id: false })
export class CourtLayoutCameraReference {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Camera', required: true })
  cameraId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  cameraName: string;

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  position: [number, number, number];

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  rotation: [number, number, number];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  lensType?: string.

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  focalLength?: number.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  coverageZone?: string.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  calibrationProfile?: string.

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  isActive: boolean.
}

@Schema({ _id: false })
export class CourtLayoutAICalibrationProfile {
  @ApiProperty()
  @Prop({ type: String, required: true })
  profileId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  enabledModules: string[];

  @ApiProperty({ required: false, minimum: 0, maximum: 1, default: 0.8 })
  @Prop({ type: Number, min: 0, max: 1, default: 0.8 })
  confidenceThreshold?: number.

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  realTimeProcessing: boolean.

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  customConfig?: Record<string, any>.

  @ApiProperty()
  @Prop({ type: Date, required: true })
  calibratedAt: Date.

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  calibratedBy?: Types.ObjectId.

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  expiresAt?: Date.

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  performanceMetrics?: Record<string, number>.
}

@Schema({ _id: false })
export class CourtLayoutAvailability {
  @ApiProperty({ enum: ['available', 'booked', 'maintenance', 'blocked', 'reserved'] })
  @Prop({ type: String, enum: ['available', 'booked', 'maintenance', 'blocked', 'reserved'], required: true, default: 'available' })
  status: string.

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  availableFrom?: Date.

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  availableUntil?: Date.

  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  bookedFixtures: Types.ObjectId[].

  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  bookedMatches: Types.ObjectId[].

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  recurringSchedule?: Record<string, any>.
}

@Schema({ _id: false })
export class CourtLayoutOperationalStatus {
  @ApiProperty({ enum: ['draft', 'under_construction', 'pending_certification', 'certified', 'operational', 'under_maintenance', 'decommissioned', 'archived'] })
  @Prop({ type: String, enum: ['draft', 'under_construction', 'pending_certification', 'certified', 'operational', 'under_maintenance', 'decommissioned', 'archived'], required: true, default: 'draft', index: true })
  status: string.

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  activatedAt?: Date.

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  activatedBy?: Types.ObjectId.

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastMaintenanceDate?: Date.

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  nextScheduledMaintenance?: Date.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  maintenanceNotes?: string.
}

@Schema({ _id: false })
export class CourtLayoutAuditInfo {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId.

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId.

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  version: number.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  auditReference?: string.
}

@Schema({ _id: false })
export class CourtLayoutArchive {
  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false, index: true })
  isArchived: boolean.

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  archivedAt?: Date.

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  archivedBy?: Types.ObjectId.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  archiveReason?: string.

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  snapshot?: Record<string, any>.
}

@Schema({ 
  collection: 'court_layouts',
  timestamps: true,
  versionKey: 'version',
})
export class CourtLayout {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  layoutId: string.

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId.

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string.

  @ApiProperty()
  @Prop({ type: String, required: true })
  code: string.

  @ApiProperty({ enum: ['standard', 'competition', 'training', 'warmup', 'practice', 'beach', 'sitting', 'custom'] })
  @Prop({ type: String, enum: ['standard', 'competition', 'training', 'warmup', 'practice', 'beach', 'sitting', 'custom'], required: true, index: true })
  type: string.

  @ApiProperty({ enum: ['draft', 'active', 'archived', 'deprecated'] })
  @Prop({ type: String, enum: ['draft', 'active', 'archived', 'deprecated'], required: true, default: 'draft', index: true })
  status: string.

  @ApiProperty({ type: CourtLayoutDimensions })
  @Prop({ type: Object, required: true })
  dimensions: CourtLayoutDimensions.

  @ApiProperty({ type: CourtLayoutNet })
  @Prop({ type: Object, required: true })
  net: CourtLayoutNet.

  @ApiProperty({ type: CourtLayoutMarkings })
  @Prop({ type: Object, required: true })
  markings: CourtLayoutMarkings.

  @ApiProperty({ type: [CourtLayoutSafetyZone] })
  @Prop({ type: [Object], default: [] })
  safetyZones: CourtLayoutSafetyZone[].

  @ApiProperty({ type: CourtLayoutEquipment })
  @Prop({ type: Object, required: true })
  equipment: CourtLayoutEquipment.

  @ApiProperty({ type: [CourtLayoutCameraReference] })
  @Prop({ type: [Object], default: [] })
  cameraReferences: CourtLayoutCameraReference[].

  @ApiProperty({ type: [CourtLayoutAICalibrationProfile] })
  @Prop({ type: [Object], default: [] })
  aiCalibrationProfiles: CourtLayoutAICalibrationProfile[].

  @ApiProperty({ type: CourtLayoutAvailability })
  @Prop({ type: Object, required: true })
  availability: CourtLayoutAvailability.

  @ApiProperty({ type: CourtLayoutOperationalStatus })
  @Prop({ type: Object, required: true })
  operationalStatus: CourtLayoutOperationalStatus.

  @ApiProperty({ type: [CourtLayoutAICalibrationProfile] })
  @Prop({ type: [Object], default: [] })
  aiCalibrationProfiles: CourtLayoutAICalibrationProfile[].

  @ApiProperty({ type: CourtLayoutAuditInfo })
  @Prop({ type: Object, required: true })
  audit: CourtLayoutAuditInfo.

  @ApiProperty({ type: CourtLayoutArchive })
  @Prop({ type: Object, required: true })
  archive: CourtLayoutArchive.

  @ApiProperty({ type: Object, default: {} })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>.
}

export const CourtLayoutSchema = SchemaFactory.createForClass(CourtLayout);

// Indexes
CourtLayoutSchema.index({ layoutId: 1 }, { unique: true });
CourtLayoutSchema.index({ venueId: 1, status: 1 });
CourtLayoutSchema.index({ name: 1 });
CourtLayoutSchema.index({ 'identity.courtId': 1 }, { unique: true });
CourtLayoutSchema.index({ 'venueId': 1, 'status': 1 });
CourtLayoutSchema.index({ 'identity.type': 1, 'identity.status': 1 });

// Virtual for isActive
CourtLayoutSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Virtual for isCertified
CourtLayoutSchema.virtual('isCertified').get(function() {
  return this.operationalStatus.status === 'certified' || this.operationalStatus.status === 'operational';
});

// Virtual for area
CourtLayoutSchema.virtual('area').get(function() {
  return this.dimensions.length * this.dimensions.width;
});