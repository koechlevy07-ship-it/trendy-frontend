import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CourtLightingDocument = CourtLighting & Document;

export enum LightingType {
  LED = 'led',
  METAL_HALIDE = 'metal_halide',
  FLUORESCENT = 'fluorescent',
  HID = 'hid',
  INDUCTION = 'induction',
  NATURAL = 'natural',
  HYBRID = 'hybrid',
}

export enum LightingZone {
  PLAYING_AREA = 'playing_area',
  FREE_ZONE = 'free_zone',
  SPECTATOR = 'spectator',
  BENCH = 'bench',
  OFFICIALS = 'officials',
  SCOREBOARD = 'scoreboard',
  CAMERA = 'camera',
  EMERGENCY = 'emergency',
  EXTERIOR = 'exterior',
  PARKING = 'parking',
}

export enum LightingControlType {
  MANUAL = 'manual',
  DMX = 'dmx',
  DALI = 'dali',
  KNX = 'knx',
  WIRELESS = 'wireless',
  POE = 'poe',
  CENTRALIZED = 'centralized',
  SCHEDULED = 'scheduled',
}

export enum LightingMode {
  MATCH = 'match',
  TRAINING = 'training',
  WARMUP = 'warmup',
  BROADCAST = 'broadcast',
  REHEARSAL = 'rehearsal',
  MAINTENANCE = 'maintenance',
  EMERGENCY = 'emergency',
  OFF = 'off',
}

@Schema({ _id: false })
export class LightFixture {
  @ApiProperty()
  @Prop({ type: String, required: true })
  fixtureId: string;

  @ApiProperty({ enum: ['led', 'metal_halide', 'fluorescent', 'hid', 'induction', 'natural', 'hybrid'] })
  @Prop({ type: String, enum: ['led', 'metal_halide', 'fluorescent', 'hid', 'induction', 'natural', 'hybrid'], required: true })
  type: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  manufacturer?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  model?: string;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 1 })
  wattage: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  lumens?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 1000, max: 10000 })
  colorTemperature?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0, max: 100 })
  cri?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0, max: 180 })
  beamAngle?: number;

  @ApiProperty({ enum: ['manual', 'dmx', 'dali', 'knx', 'wireless', 'poe', 'centralized', 'scheduled'] })
  @Prop({ type: String, enum: ['manual', 'dmx', 'dali', 'knx', 'wireless', 'poe', 'centralized', 'scheduled'], required: true })
  controlType: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  dmxAddress?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  daliAddress?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  ipAddress?: string;

  @ApiProperty({ type: [Number], required: true })
  @Prop({ type: [Number], required: true })
  position: [number, number, number];

  @ApiProperty({ type: [Number], required: true })
  @Prop({ type: [Number], required: true })
  rotation: [number, number, number];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  mountingHeight?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  mountingType?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  installationDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastMaintenanceDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  nextMaintenanceDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  serialNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  warrantyExpiry?: string;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  isDimmable: boolean;

  @ApiProperty({ required: false, min: 0, max: 100 })
  @Prop({ type: Number, min: 0, max: 100, default: 100 })
  defaultIntensity: number;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  photometricData?: Record<string, any>;
}

@Schema({ _id: false })
export class LightingZone {
  @ApiProperty()
  @Prop({ type: String, required: true })
  zoneId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ enum: ['playing_area', 'free_zone', 'spectator', 'bench', 'officials', 'scoreboard', 'camera', 'emergency', 'exterior', 'parking'] })
  @Prop({ type: String, enum: ['playing_area', 'free_zone', 'spectator', 'bench', 'officials', 'scoreboard', 'camera', 'emergency', 'exterior', 'parking'], required: true })
  zoneType: string;

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  fixtures: any[];

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 0 })
  targetLux: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 1 })
  @Prop({ type: Number, min: 0, max: 1, default: 1 })
  uniformityRatio: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @Prop({ type: Number, min: 0, max: 100 })
  glareRating?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  controlGroup?: string;

  @ApiProperty({ enum: ['match', 'training', 'warmup', 'broadcast', 'rehearsal', 'maintenance', 'emergency', 'off'] })
  @Prop({ type: String, enum: ['match', 'training', 'warmup', 'broadcast', 'rehearsal', 'maintenance', 'emergency', 'off'], default: 'off' })
  defaultMode: string;

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  presets: any[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  schedules: any[];
}

@Schema({ _id: false })
export class LightingScene {
  @ApiProperty()
  @Prop({ type: String, required: true })
  sceneId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ enum: ['match', 'training', 'warmup', 'broadcast', 'rehearsal', 'maintenance', 'emergency', 'off'] })
  @Prop({ type: String, enum: ['match', 'training', 'warmup', 'broadcast', 'rehearsal', 'maintenance', 'emergency', 'off'], required: true })
  mode: string;

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  zoneSettings: any[];

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  isDefault: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  createdAt?: Date;
}

@Schema({ _id: false })
export class LightingControl {
  @ApiProperty({ enum: ['manual', 'dmx', 'dali', 'knx', 'wireless', 'poe', 'centralized', 'scheduled'] })
  @Prop({ type: String, enum: ['manual', 'dmx', 'dali', 'knx', 'wireless', 'poe', 'centralized', 'scheduled'], required: true })
  type: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  controllerId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  controllerIp?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  protocol?: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  supportedProtocols: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  centralSystemUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  apiKey?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  networkConfig?: Record<string, any>;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  remoteAccessEnabled: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  backupControllerId?: string;
}

@Schema({ _id: false })
export class LightingAuditInfo {
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
export class LightingArchive {
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
  collection: 'court_lighting',
  timestamps: true,
  versionKey: 'version',
})
export class CourtLighting {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  lightingId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Court', required: true, index: true })
  courtId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Venue' })
  venueId?: Types.ObjectId;

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  fixtures: any[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  zones: any[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  scenes: any[];

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  control: any;

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  emergencyLighting?: any;

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

export const CourtLightingSchema = SchemaFactory.createForClass(CourtLighting);

// Indexes
CourtLightingSchema.index({ lightingId: 1 }, { unique: true });
CourtLightingSchema.index({ courtId: 1 });
CourtLightingSchema.index({ venueId: 1 });
CourtLightingSchema.index({ 'fixtures.status': 1 });
CourtLightingSchema.index({ 'zones.zoneType': 1 });

// Virtual for totalFixtures
CourtLightingSchema.virtual('totalFixtures').get(function() {
  return this.fixtures?.length || 0;
});

// Virtual for activeFixtures
CourtLightingSchema.virtual('activeFixtures').get(function() {
  return this.fixtures?.filter(f => f.status === 'active').length || 0;
});

// Virtual for totalPowerConsumption
CourtLightingSchema.virtual('totalPowerConsumption').get(function() {
  return this.fixtures?.reduce((sum, f) => sum + (f.wattage || 0), 0) || 0;
});

// Virtual for isOnline
CourtLightingSchema.virtual('isOnline').get(function() {
  return this.fixtures?.some(f => f.status === 'active') || false;
});