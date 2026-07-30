/**
 * Court Schema - Chapter 13 Part 1
 * 
 * Core domain model for courts in the volleyball platform.
 * Supports indoor courts, beach courts, sitting volleyball courts, grass courts, etc.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CourtDocument = Court & Document;

export enum CourtType {
  INDOOR = 'indoor',
  BEACH = 'beach',
  SITTING = 'sitting',
  GRASS = 'grass',
  CLAY = 'clay',
  SYNTHETIC = 'synthetic',
  HARD = 'hard',
  PRACTICE = 'practice',
  WARMUP = 'warmup',
}

export enum CourtSurface {
  WOOD = 'wood',
  SYNTHETIC = 'synthetic',
  TARA = 'tara',
  SAND = 'sand',
  GRASS = 'grass',
  CLAY = 'clay',
  CONCRETE = 'concrete',
  ASPHALT = 'asphalt',
  ACRYLIC = 'acrylic',
  POLYURETHANE = 'polyurethane',
  RUBBER = 'rubber',
}

export enum CourtOrientation {
  NORTH_SOUTH = 'north_south',
  EAST_WEST = 'east_west',
  NORTHEAST_SOUTHWEST = 'northeast_southwest',
  NORTHWEST_SOUTHEAST = 'northwest_southeast',
}

export enum CourtStatus {
  DRAFT = 'draft',
  UNDER_CONSTRUCTION = 'under_construction',
  PENDING_CERTIFICATION = 'pending_certification',
  CERTIFIED = 'certified',
  OPERATIONAL = 'operational',
  UNDER_MAINTENANCE = 'under_maintenance',
  DECOMMISSIONED = 'decommissioned',
  ARCHIVED = 'archived',
}

export enum NetType {
  INDOOR = 'indoor',
  BEACH = 'beach',
  SITTING = 'sitting',
  TRAINING = 'training',
  COMPETITION = 'competition',
}

export enum CourtSide {
  A = 'A',
  B = 'B',
  LEFT = 'left',
  RIGHT = 'right',
}

export enum SafetyZoneType {
  FREE = 'free',
  OBSTRUCTION = 'obstruction',
  PENALTY = 'penalty',
  SERVICE = 'service',
  END_LINE = 'end_line',
  SIDE_LINE = 'side_line',
  ATTACK_LINE = 'attack_line',
  CENTER_LINE = 'center_line',
}

@Schema({ _id: false })
export class CourtIdentity {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  courtId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true, maxlength: 10 })
  shortName: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  displayName: string;

  @ApiProperty({ enum: CourtType })
  @Prop({ type: String, enum: CourtType, required: true, index: true })
  type: CourtType;

  @ApiProperty({ enum: CourtStatus })
  @Prop({ type: String, enum: CourtStatus, required: true, default: CourtStatus.DRAFT, index: true })
  status: CourtStatus;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;
}

@Schema({ _id: false })
export class CourtVenueReference {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  venueName: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  venueCode?: string;
}

@Schema({ _id: false })
export class CourtDimensions {
  @ApiProperty()
  @Prop({ type: Number, required: true, min: 10 })
  length: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 5 })
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

  @ApiProperty({ enum: CourtOrientation })
  @Prop({ type: String, enum: CourtOrientation, required: true })
  orientation: CourtOrientation;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  hasRaisedPlatform?: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  platformHeight?: number;
}

@Schema({ _id: false })
export class CourtSurface {
  @ApiProperty({ enum: CourtSurface })
  @Prop({ type: String, enum: CourtSurface, required: true })
  surfaceType: CourtSurface;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  surfaceMaterial?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  surfaceColor?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  surfaceBrand?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  installedDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  maintenanceSchedule?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastMaintenanceDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  shockAbsorption?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  verticalDeformation?: number;
}

@Schema({ _id: false })
export class CourtMarkings {
  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  boundaryLines: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  attackLines: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  centerLine: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  serviceZones: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  substitutionZones: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  liberoReplacementZone: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  coachRestrictionLine: boolean.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  lineColor?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 1, max: 10, default: 5 })
  lineWidth?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  lineMaterial?: string;
}

@Schema({ _id: false })
export class SafetyZone {
  @ApiProperty({ enum: SafetyZoneType })
  @Prop({ type: String, enum: SafetyZoneType, required: true })
  type: SafetyZoneType;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 0 })
  width: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  length?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  surface?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  isObstructed: boolean.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  obstructionDetails?: string.

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  isCompliant: boolean.
}

export enum SafetyZoneType {
  FREE = 'free',
  OBSTRUCTION = 'obstruction',
  PENALTY = 'penalty',
  SERVICE = 'service',
  END_LINE = 'end_line',
  SIDE_LINE = 'side_line',
  ATTACK_LINE = 'attack_line',
  CENTER_LINE = 'center_line',
}

@Schema({ _id: false })
export class NetConfiguration {
  @ApiProperty({ enum: NetType })
  @Prop({ type: String, enum: NetType, required: true })
  type: NetType;

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
  hasAntennae: boolean.

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  antennaHeight?: number.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  sideBandsColor?: string.

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  hasSideBands: boolean.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  netSystem?: string.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  tensionSystem?: string.

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  tensionForce?: number.
}

@Schema({ _id: false })
export class CourtEquipment {
  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  hasRefereeStand: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  refereeStandType?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  hasScoreboard: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  scoreboardType?: string.

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  hasVideoReplay: boolean.

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  hasChallengeSystem: boolean.

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  hasTeamBenches: boolean.

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0, default: 14 })
  benchCapacity?: number.

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  hasWarmupArea: boolean.

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  hasMedicalArea: boolean.

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  hasEquipmentStorage: boolean.

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  additionalEquipment: string[].
}

@Schema({ _id: false })
export class CourtCameraReference {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Camera', required: true })
  cameraId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  cameraName: string;

  @ApiProperty({ type: [Number] })
  @Prop({ type: [Number], required: true })
  position: [number, number, number];

  @ApiProperty({ type: [Number] })
  @Prop({ type: [Number], required: true })
  rotation: [number, number, number];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  lensType?: string;

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
export class AICalibrationProfile {
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

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0, max: 1, default: 0.8 })
  confidenceThreshold: number.

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
  performanceMetrics?: Record<string, any>.
}

@Schema({ _id: false })
export class CourtAvailability {
  @ApiProperty({ enum: ['available', 'booked', 'maintenance', 'blocked', 'reserved'] })
  @Prop({ type: String, enum: ['available', 'booked', 'maintenance', 'blocked', 'reserved'], required: true, default: 'available' })
  status: 'available' | 'booked' | 'maintenance' | 'blocked' | 'reserved';

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  availableFrom?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  availableUntil?: Date;

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], default: [] })
  bookedFixtures: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], default: [] })
  bookedMatches: Types.ObjectId[];

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  recurringSchedule?: Record<string, any>;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;
}

@Schema({ _id: false })
export class CourtOperationalStatus {
  @ApiProperty({ enum: CourtStatus })
  @Prop({ type: String, enum: CourtStatus, required: true, default: CourtStatus.DRAFT, index: true })
  status: CourtStatus;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  activatedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  activatedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastMaintenanceDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  nextScheduledMaintenance?: Date.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  maintenanceNotes?: string.
}

@Schema({ _id: false })
export class CourtAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  version: number.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  auditReference?: string.
}

@Schema({ _id: false })
export class CourtArchive {
  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false, index: true })
  isArchived: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  archivedAt?: Date;

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

@Schema({ _id: false })
export class CourtAIRecipe {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  recognitionProfileId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  preferredCourtTemplate?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  jerseyRecognitionTemplate?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  logoRecognitionProfile?: string.

  @ApiProperty({ required: false })
  @Prop({ type: String })
  courtPreferences?: string.

  @ApiProperty({ required: false, type: [Number] })
  @Prop({ type: [Number], default: [] })
  courtEmbedding?: number[].
}

@Schema({
  collection: 'courts',
  timestamps: true,
  versionKey: 'version',
})
export class Court {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  courtId: string;

  @ApiProperty({ type: CourtIdentity })
  @Prop({ type: CourtIdentity, required: true })
  identity: CourtIdentity;

  @ApiProperty({ type: CourtVenueReference })
  @Prop({ type: CourtVenueReference, required: true })
  venue: CourtVenueReference;

  @ApiProperty({ type: CourtDimensions })
  @Prop({ type: CourtDimensions, required: true })
  dimensions: CourtDimensions;

  @ApiProperty({ type: CourtSurface })
  @Prop({ type: CourtSurface, required: true })
  surface: CourtSurface;

  @ApiProperty({ type: CourtMarkings })
  @Prop({ type: CourtMarkings, required: true })
  markings: CourtMarkings;

  @ApiProperty({ type: [SafetyZone] })
  @Prop({ type: [SafetyZone], default: [] })
  safetyZones: SafetyZone[];

  @ApiProperty({ type: NetConfiguration })
  @Prop({ type: NetConfiguration, required: true })
  net: NetConfiguration;

  @ApiProperty({ type: CourtEquipment })
  @Prop({ type: CourtEquipment, required: true })
  equipment: CourtEquipment;

  @ApiProperty({ type: [CourtCameraReference] })
  @Prop({ type: [CourtCameraReference], default: [] })
  cameraReferences: CourtCameraReference[];

  @ApiProperty({ type: [AICalibrationProfile] })
  @Prop({ type: [AICalibrationProfile], default: [] })
  aiCalibrationProfiles: AICalibrationProfile[];

  @ApiProperty({ type: CourtAvailability })
  @Prop({ type: CourtAvailability, required: true })
  availability: CourtAvailability;

  @ApiProperty({ type: CourtOperationalStatus })
  @Prop({ type: CourtOperationalStatus, required: true })
  operationalStatus: CourtOperationalStatus;

  @ApiProperty({ type: CourtAuditInfo })
  @Prop({ type: CourtAuditInfo, required: true })
  audit: CourtAuditInfo;

  @ApiProperty({ type: CourtArchive })
  @Prop({ type: CourtArchive, required: true })
  archive: CourtArchive;

  @ApiProperty({ type: CourtAIRecipe })
  @Prop({ type: CourtAIRecipe, required: true })
  aiRecipe: CourtAIRecipe;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const CourtSchema = SchemaFactory.createForClass(Court);

// Indexes
CourtSchema.index({ courtId: 1 }, { unique: true });
CourtSchema.index({ 'venue.venueId': 1, 'identity.status': 1 });
CourtSchema.index({ 'identity.type': 1, 'identity.status': 1 });
CourtSchema.index({ 'identity.name': 'text', 'identity.shortName': 'text', 'identity.description': 'text' });
CourtSchema.index({ 'venue.venueId': 1, 'identity.status': 1 });
CourtSchema.index({ 'operationalStatus.status': 1 });
CourtSchema.index({ 'availability.status': 1 });
CourtSchema.index({ 'aiCalibrationProfiles.profileId': 1 });

// Virtual for isActive
CourtSchema.virtual('isActive').get(function() {
  return this.operationalStatus.status === CourtStatus.OPERATIONAL;
});

// Virtual for isCertified
CourtSchema.virtual('isCertified').get(function() {
  return this.operationalStatus.status === CourtStatus.CERTIFIED || 
         this.operationalStatus.status === CourtStatus.OPERATIONAL;
});

// Virtual for court area
CourtSchema.virtual('area').get(function() {
  return this.dimensions.length * this.dimensions.width;
});

// Virtual for isAvailable
CourtSchema.virtual('isAvailable').get(function() {
  return this.availability.status === 'available' && 
         this.operationalStatus.status === CourtStatus.OPERATIONAL;
});