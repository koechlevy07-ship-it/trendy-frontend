import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CameraDocument = Camera & Document;

export enum CameraType {
  FIXED = 'fixed',
  PTZ = 'ptz',
  DOME = 'dome',
  BULLET = 'bullet',
  FISHEYE = 'fisheye',
  THERMAL = 'thermal',
  PANORAMIC = 'panoramic',
  ROBOTIC = 'robotic',
}

export enum CameraStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
  DECOMMISSIONED = 'decommissioned',
}

export enum CameraResolution {
  HD_720P = '720p',
  FULL_HD_1080P = '1080p',
  QHD_1440P = '1440p',
  UHD_4K = '4k',
  UHD_8K = '8k',
}

export enum StreamProtocol {
  RTMP = 'rtmp',
  RTSP = 'rtsp',
  HLS = 'hls',
  SRT = 'srt',
  WEBRTC = 'webrtc',
  MPEG_DASH = 'mpeg_dash',
}

@Schema({ _id: false })
export class CameraPosition {
  @ApiProperty()
  @Prop({ type: [Number], required: true })
  position: [number, number, number];

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  rotation: [number, number, number];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  mountingPoint?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  mountingHeight?: string;
}

@Schema({ _id: false })
export class CameraLens {
  @ApiProperty()
  @Prop({ type: String, required: true })
  model: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  manufacturer?: string;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 1 })
  focalLength: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 0.1, max: 3 })
  maxAperture: number;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  hasAutoFocus: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  hasOpticalZoom: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 1 })
  zoomRange?: number;
}

@Schema({ _id: false })
export class CameraStream {
  @ApiProperty()
  @Prop({ type: String, required: true })
  streamId: string;

  @ApiProperty({ enum: StreamProtocol })
  @Prop({ type: String, enum: StreamProtocol, required: true })
  protocol: StreamProtocol;

  @ApiProperty()
  @Prop({ type: String, required: true })
  url: string;

  @ApiProperty({ enum: CameraResolution })
  @Prop({ type: String, enum: CameraResolution, required: true })
  resolution: CameraResolution;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 1, max: 120 })
  fps: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 100 })
  bitrate: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  codec?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  isPrimary: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

@Schema({ _id: false })
export class CameraCalibration {
  @ApiProperty()
  @Prop({ type: String, required: true })
  profileId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  profileName: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  enabledModules: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0, max: 1, default: 0.8 })
  confidenceThreshold?: number;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  realTimeProcessing: boolean;

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  customConfig?: Record<string, any>;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  calibratedAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  calibratedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  expiresAt?: Date;

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  performanceMetrics?: Record<string, any>;

  @ApiProperty({ default: 1 })
  @Prop({ type: Number, default: 1 })
  version: number;
}

@Schema({ _id: false })
export class CameraMaintenance {
  @ApiProperty()
  @Prop({ type: Date, required: true })
  scheduledDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  completedDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  type?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  performedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  cost?: number;
}

@Schema({ _id: false })
export class CameraAuditInfo {
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
export class CameraArchive {
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
  collection: 'cameras',
  timestamps: true,
  versionKey: 'version',
})
export class Camera {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  cameraId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Court' })
  courtId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  cameraId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  serialNumber?: string;

  @ApiProperty({ enum: CameraType })
  @Prop({ type: String, enum: CameraType, required: true, index: true })
  type: CameraType;

  @ApiProperty({ enum: CameraStatus })
  @Prop({ type: String, enum: CameraStatus, required: true, default: CameraStatus.INACTIVE, index: true })
  status: CameraStatus;

  @ApiProperty({ enum: CameraResolution })
  @Prop({ type: String, enum: CameraResolution, required: true })
  maxResolution: CameraResolution;

  @ApiProperty({ type: CameraLens })
  @Prop({ type: CameraLens, required: true })
  lens: CameraLens;

  @ApiProperty({ type: CameraPosition })
  @Prop({ type: CameraPosition, required: true })
  position: CameraPosition;

  @ApiProperty({ type: [CameraStream], default: [] })
  @Prop({ type: [CameraStream], default: [] })
  streams: CameraStream[];

  @ApiProperty({ type: [CameraCalibration], default: [] })
  @Prop({ type: [CameraCalibration], default: [] })
  calibrations: CameraCalibration[];

  @ApiProperty({ type: [CameraMaintenance], default: [] })
  @Prop({ type: [CameraMaintenance], default: [] })
  maintenanceHistory: CameraMaintenance[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  manufacturer?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  model?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  manufactureDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  purchaseDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  warrantyExpiry?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  firmwareVersion?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  ipAddress?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  macAddress?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  subnetMask?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  gateway?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  dnsServers?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  ntpServer?: string;

  @ApiProperty({ type: CameraAuditInfo })
  @Prop({ type: CameraAuditInfo, required: true })
  audit: CameraAuditInfo;

  @ApiProperty({ type: CameraArchive })
  @Prop({ type: CameraArchive, required: true })
  archive: CameraArchive;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const CameraSchema = SchemaFactory.createForClass(Camera);

// Indexes
CameraSchema.index({ cameraId: 1 }, { unique: true });
CameraSchema.index({ venueId: 1, status: 1 });
CameraSchema.index({ venueId: 1, courtId: 1 });
CameraSchema.index({ serialNumber: 1 });
CameraSchema.index({ status: 1 });
CameraSchema.index({ type: 1 });
CameraSchema.index({ 'position.position': '2dsphere' });

// Virtual for isOnline
CameraSchema.virtual('isOnline').get(function() {
  return this.status === 'active';
});

// Virtual for isCalibrated
CameraSchema.virtual('isCalibrated').get(function() {
  return this.calibrations.some(c => c.expiresAt && c.expiresAt > new Date());
});

// Virtual for latestCalibration
CameraSchema.virtual('latestCalibration').get(function() {
  if (this.calibrations.length === 0) return null;
  return this.calibrations.reduce((latest, current) => 
    current.calibratedAt > latest.calibratedAt ? current : latest
  );
});