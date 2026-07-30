import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VenueMediaAssetDocument = VenueMediaAsset & Document;

export enum MediaAssetType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  MODEL_3D = 'model_3d',
  POINT_CLOUD = 'point_cloud',
  PANORAMA = 'panorama',
  VIRTUAL_TOUR = 'virtual_tour',
  FLOOR_PLAN = 'floor_plan',
  SITE_PLAN = 'site_plan',
  ARCHITECTURAL_DRAWING = 'architectural_drawing',
  SCHEMATIC = 'schematic',
  DIAGRAM = 'diagram',
  MAP = 'map',
  LAYOUT = 'layout',
  SCHEMA = 'schema',
  BLUEPRINT = 'blueprint',
  RENDERING = 'rendering',
  ANIMATION = 'animation',
  SIMULATION = 'simulation',
  OTHER = 'other',
}

export enum MediaAssetStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum MediaAssetAccessLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
}

@Schema({ _id: false })
export class MediaAssetMetadata {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  title?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  author?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  creator?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  creationDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  software?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  softwareVersion?: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  tags: string[];

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  keywords: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  category?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  subCategory?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  license?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  licenseUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  attribution?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  copyright?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  customFields?: Record<string, any>;
}

@Schema({ _id: false })
export class MediaAssetFile {
  @ApiProperty()
  @Prop({ type: String, required: true })
  fileId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  fileName: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  originalName: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  mimeType: string;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  fileSize: number;

  @ApiProperty()
  @Prop({ type: String, required: true })
  storagePath: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  cdnUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  thumbnailUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  previewUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  downloadUrl?: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  mimeType: string;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  fileSize: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  checksum?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  checksumAlgorithm?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  encoding?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    duration?: number;
    pages?: number;
  };

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty()
  @Prop({ type: Date, required: true, default: Date.now })
  uploadedAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  uploadedBy?: Types.ObjectId;
}

@Schema({ _id: false })
export class MediaAssetProcessing {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  status?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  startedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  completedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  error?: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  processingSteps: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  progress?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  processorVersion?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  processingOptions?: Record<string, any>;
}

@Schema({ _id: false })
export class MediaAssetVariants {
  @ApiProperty({ required: false })
  @Prop({ type: Object })
  thumbnail?: {
    url: string;
    width: number;
    height: number;
    fileSize: number;
  };

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  preview?: {
    url: string;
    width: number;
    height: number;
    fileSize: number;
  };

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  medium?: {
    url: string;
    width: number;
    height: number;
    fileSize: number;
  };

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  large?: {
    url: string;
    width: number;
    height: number;
    fileSize: number;
  };

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  original?: {
    url: string;
    width: number;
    height: number;
    fileSize: number;
  };

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  customVariants: Array<{
    name: string;
    url: string;
    width: number;
    height: number;
    fileSize: number;
    mimeType: string;
  }>;
}

@Schema({ _id: false })
export class MediaAssetAccess {
  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  authorizedRoles: string[];

  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  authorizedUsers: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  authorizedGroups: Types.ObjectId[];

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  isPublic: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, { type: Boolean, default: false })
  requiresAuthentication: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  expiresAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  passwordHint?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  downloadPassword?: string;
}

@Schema({ _id: false })
export class MediaAssetUsage {
  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  viewCount: number;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  downloadCount: number;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  shareCount: number;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  embedCount: number;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastAccessedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  lastAccessedBy?: Types.ObjectId;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  referringUrls: string[];
}

@Schema({ _id: false })
export class MediaAssetProcessing {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  status?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  startedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  completedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  error?: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  processingSteps: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  progress?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  processorVersion?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  processingOptions?: Record<string, any>;
}

@Schema({ _id: false })
export class MediaAssetAudit {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  deletedBy?: Types.ObjectId;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  version: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  auditReference?: string;
}

@Schema({ _id: false })
export class MediaAssetArchive {
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
  collection: 'venue_media_assets',
  timestamps: true,
  versionKey: 'version',
})
export class VenueMediaAsset {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  mediaAssetId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Court' })
  courtId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  mediaAssetId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ enum: ['image', 'video', 'audio', 'document', 'model_3d', 'point_cloud', 'panorama', 'virtual_tour', 'floor_plan', 'site_plan', 'architectural_drawing', 'schematic', 'diagram', 'map', 'layout', 'schema', 'blueprint', 'rendering', 'animation', 'simulation', 'other'] })
  @Prop({ type: String, enum: ['image', 'video', 'audio', 'document', 'model_3d', 'point_cloud', 'panorama', 'virtual_tour', 'floor_plan', 'site_plan', 'architectural_drawing', 'schematic', 'diagram', 'map', 'layout', 'schema', 'blueprint', 'rendering', 'animation', 'simulation', 'other'], required: true, index: true })
  type: string;

  @ApiProperty()
  @Prop({ type: Object, required: true })
  file: any;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  metadata?: any;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  variants?: any;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  access?: any;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  usage?: any;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  processing?: any;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  audit?: any;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  archive?: any;

  @ApiProperty({ type: Object, default: {} })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const VenueMediaAssetSchema = SchemaFactory.createForClass(VenueMediaAsset);

// Indexes
VenueMediaAssetSchema.index({ mediaAssetId: 1 }, { unique: true });
VenueMediaAssetSchema.index({ venueId: 1, type: 1 });
VenueMediaAssetSchema.index({ venueId: 1, status: 1 });
VenueMediaAssetSchema.index({ courtId: 1 });
VenueMediaAssetSchema.index({ 'file.mimeType': 1 });
VenueMediaAssetSchema.index({ 'file.fileSize': 1 });
VenueMediaAssetSchema.index({ 'metadata.tags': 1 });
VenueMediaAssetSchema.index({ 'metadata.keywords': 1 });
VenueMediaAssetSchema.index({ 'metadata.category': 1 });
VenueMediaAssetSchema.index({ 'access.authorizedRoles': 1 });
VenueMediaAssetSchema.index({ 'access.authorizedUsers': 1 });
VenueMediaAssetSchema.index({ 'access.authorizedGroups': 1 });
VenueMediaAssetSchema.index({ 'usage.viewCount': -1 });
VenueMediaAssetSchema.index({ 'usage.lastAccessedAt': -1 });

// Virtual for isImage
VenueMediaAssetSchema.virtual('isImage').get(function() {
  return this.type === 'image';
});

// Virtual for isVideo
VenueMediaAssetSchema.virtual('isVideo').get(function() {
  return this.type === 'video';
});

// Virtual for isDocument
VenueMediaAssetSchema.virtual('isDocument').get(function() {
  return this.type === 'document';
});

// Virtual for fileSizeInMB
VenueMediaAssetSchema.virtual('fileSizeInMB').get(function() {
  if (this.file && this.file.fileSize) {
    return (this.file.fileSize / (1024 * 1024)).toFixed(2);
  }
  return '0';
});

// Virtual for duration (for video/audio)
VenueMediaAssetSchema.virtual('duration').get(function() {
  if (this.file && this.file.metadata && this.file.metadata.duration) {
    return this.file.metadata.duration;
  }
  return null;
});