/**
 * Venue Schema - Chapter 13 Part 1
 * 
 * Core domain model for venues in the volleyball platform.
 * Supports sports facilities, arenas, training centers, beach parks, etc.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VenueDocument = Venue & Document;

export enum VenueType {
  INDOOR_ARENA = 'indoor_arena',
  OUTDOOR_COURT = 'outdoor_court',
  BEACH_VOLLEYBALL_PARK = 'beach_volleyball_park',
  SITTING_VOLLEYBALL_COURT = 'sitting_volleyball_court',
  TRAINING_FACILITY = 'training_facility',
  COMPETITION_VENUE = 'competition_venue',
  COMMUNITY_SPORTS_HALL = 'community_sports_hall',
  UNIVERSITY_SPORT_COMPLEX = 'university_sport_complex',
  NATIONAL_ARENA = 'national_arena',
  OLYMPIC_TRAINING_CENTRE = 'olympic_training_centre',
  COMMUNITY_SPORTS_HALL = 'community_sports_hall',
  SCHOOL_GYMNASIUM = 'school_gymnasium',
  PRIVATE_CLUB = 'private_club',
  OTHER = 'other',
}

export enum VenueStatus {
  DRAFT = 'draft',
  UNDER_CONSTRUCTION = 'under_construction',
  READY_FOR_CERTIFICATION = 'ready_for_certification',
  CERTIFIED = 'certified',
  OPERATIONAL = 'operational',
  UNDER_MAINTENANCE = 'under_maintenance',
  DECOMMISSIONED = 'decommissioned',
  ARCHIVED = 'archived',
}

export enum SurfaceType {
  WOOD = 'wood',
  SYNTHETIC = 'synthetic',
  CONCRETE = 'concrete',
  SAND = 'sand',
  GRASS = 'grass',
  TARTAN = 'tartan',
  RUBBER = 'rubber',
  CLAY = 'clay',
  OTHER = 'other',
}

export enum CertificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
}

@Schema({ _id: false })
export class VenueIdentity {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  venueId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true, maxlength: 20 })
  shortName: string;

  @ApiProperty()
  @Prop({ type: String })
  displayName: string;

  @ApiProperty()
  @Prop({ type: String })
  description: string;

  @ApiProperty({ enum: VenueType })
  @Prop({ type: String, enum: VenueType, required: true, index: true })
  type: VenueType;

  @ApiProperty()
  @Prop({ type: String })
  code: string;
}

@Schema({ _id: false })
export class VenueOwnership {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  parentOrganizationId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  governingBodyId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  governingBodyName?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  affiliationDate?: Date;

  @ApiProperty()
  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  governanceTier: number;
}

@Schema({ _id: false })
export class VenueAddress {
  @ApiProperty()
  @Prop({ type: String, required: true })
  street: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  street2?: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  city: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  stateProvince?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  county?: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  country: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  postalCode: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };

  @ApiProperty({ required: false })
  @Prop({ type: String })
  timezone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  directions?: string;
}

@Schema({ _id: false })
export class VenueContact {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  email?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  phone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  website?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  primaryContactPerson?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  primaryContactPhone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  supportEmail?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

@Schema({ _id: false })
export class VenueCapacity {
  @ApiProperty()
  @Prop({ type: Number, required: true, min: 0 })
  seatingCapacity: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  standingCapacity?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  vipCapacity?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  wheelchairCapacity?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  staffCapacity?: number;
}

@Schema({ _id: false })
export class GeoCoordinates {
  @ApiProperty()
  @Prop({ type: Number, required: true, min: -90, max: 90 })
  latitude: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: -180, max: 180 })
  longitude: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  altitude?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  coordinateSystem?: string;
}

@Schema({ _id: false })
export class VenueFacilities {
  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  changingRooms: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  medicalRooms: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  officialsRooms: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  mediaRooms: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  broadcastFacilities: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  vipLounges: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  warmupAreas: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  equipmentStores: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  parkingAreas: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  lightingSystem?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  internetConnectivity?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  powerSupply?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  waterSupply?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  hvacSystem?: string;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  accessibilityFeatures: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  safetyEquipment: string[];
}

@Schema({ _id: false })
export class VenueCertification {
  @ApiProperty()
  @Prop({ type: String, required: true })
  certificationId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  issuingAuthority: string;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  issuedDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  expiryDate?: Date;

  @ApiProperty({ enum: CertificationStatus })
  @Prop({ type: String, enum: CertificationStatus, required: true, default: CertificationStatus.PENDING })
  status: CertificationStatus;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  certificateNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  certificateUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: [String] })
  scope?: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  certifiedBy?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  certifiedAt?: Date;
}

@Schema({ _id: false })
export class CameraInfrastructure {
  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  cameraPositions: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  cameraIdentifiers: string[];

  @ApiProperty({ type: [Number] })
  @Prop({ type: [Number], default: [] })
  viewingAngles: number[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  coverageZones: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  calibrationProfiles: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  primaryCameraId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  streamingConfig?: {
    primaryStreamUrl: string;
    backupStreamUrl?: string;
    protocol: string;
    bitrate: number;
    resolution: string;
  };
}

@Schema({ _id: false })
export class MediaAssets {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  logoUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  logoDarkUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  logoLightUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  bannerUrl?: string;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  galleryImages: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  virtualTourUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  floorPlanUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  sitePlanUrl?: string;
}

@Schema({ _id: false })
export class VenueOperationalStatus {
  @ApiProperty({ enum: VenueStatus })
  @Prop({ type: String, enum: VenueStatus, required: true, default: VenueStatus.DRAFT, index: true })
  status: VenueStatus;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  activatedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  activatedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  decommissionedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  decommissionedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  decommissionReason?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastMaintenanceDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  nextScheduledMaintenance?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Number, default: 0 })
  totalEventsHosted: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, default: 0 })
  totalMatchesHosted: number;
}

@Schema({ _id: false })
export class VenueAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  version: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  auditReference?: string;
}

@Schema({ _id: false })
export class VenueArchive {
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

@Schema({ _id: false })
export class AIRecipe {
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
  logoRecognitionProfile?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  courtPreferences?: string;

  @ApiProperty({ required: false, type: [Number] })
  @Prop({ type: [Number], default: [] })
  organizationEmbedding?: number[];
}

@Schema({ 
  collection: 'venues',
  timestamps: true,
  versionKey: 'version',
})
export class Venue {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  venueId: string;

  @ApiProperty({ type: VenueIdentity })
  @Prop({ type: VenueIdentity, required: true })
  identity: VenueIdentity;

  @ApiProperty({ type: VenueOwnership })
  @Prop({ type: VenueOwnership, required: true })
  ownership: VenueOwnership;

  @ApiProperty({ type: VenueAddress })
  @Prop({ type: VenueAddress, required: true })
  address: VenueAddress;

  @ApiProperty({ type: GeoCoordinates })
  @Prop({ type: GeoCoordinates, required: true })
  coordinates: GeoCoordinates;

  @ApiProperty({ type: VenueContact })
  @Prop({ type: VenueContact, required: true })
  contact: VenueContact;

  @ApiProperty({ type: VenueCapacity })
  @Prop({ type: VenueCapacity, required: true })
  capacity: VenueCapacity;

  @ApiProperty({ type: VenueFacilities })
  @Prop({ type: VenueFacilities, required: true })
  facilities: VenueFacilities;

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'Court', default: [], index: true })
  courtIds: Types.ObjectId[];

  @ApiProperty({ type: [VenueCertification] })
  @Prop({ type: [VenueCertification], default: [] })
  certifications: VenueCertification[];

  @ApiProperty({ type: CameraInfrastructure })
  @Prop({ type: CameraInfrastructure, required: true })
  cameraInfrastructure: CameraInfrastructure;

  @ApiProperty({ type: MediaAssets })
  @Prop({ type: MediaAssets, required: true })
  mediaAssets: MediaAssets;

  @ApiProperty({ type: VenueOperationalStatus })
  @Prop({ type: VenueOperationalStatus, required: true })
  operationalStatus: VenueOperationalStatus;

  @ApiProperty({ type: VenueAuditInfo })
  @Prop({ type: VenueAuditInfo, required: true })
  audit: VenueAuditInfo;

  @ApiProperty({ type: VenueArchive })
  @Prop({ type: VenueArchive, required: true })
  archive: VenueArchive;

  @ApiProperty({ type: AIRecipe })
  @Prop({ type: AIRecipe, required: true })
  aiMetadata: AIRecipe;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const VenueSchema = SchemaFactory.createForClass(Venue);

// Indexes for performance
VenueSchema.index({ venueId: 1 }, { unique: true });
VenueSchema.index({ 'identity.name': 'text', 'identity.shortName': 'text', 'identity.description': 'text' });
VenueSchema.index({ 'ownership.organizationId': 1 });
VenueSchema.index({ 'operationalStatus.status': 1 });
VenueSchema.index({ 'address.country': 1, 'address.city': 1 });
VenueSchema.index({ coordinates: '2dsphere' });
VenueSchema.index({ 'ownership.organizationId': 1, 'operationalStatus.status': 1 });
VenueSchema.index({ 'identity.type': 1, 'operationalStatus.status': 1 });