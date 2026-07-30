import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VenueFacilityDocument = VenueFacility & Document;

export enum FacilityType {
  LOCKER_ROOM = 'locker_room',
  MEDICAL_ROOM = 'medical_room',
  OFFICIALS_ROOM = 'officials_room',
  BROADCAST_ROOM = 'broadcast_room',
  MEDIA_CENTER = 'media_center',
  VIP_LOUNGE = 'vip_lounge',
  WARMUP_AREA = 'warmup_area',
  EQUIPMENT_STORE = 'equipment_store',
  PARKING = 'parking',
  CAFETERIA = 'cafeteria',
  MEDICAL_CENTER = 'medical_center',
  DOPING_CONTROL = 'doping_control',
  PRESS_CONFERENCE = 'press_conference',
  OFFICIALS_LOUNGE = 'officials_lounge',
  ATHLETES_LOUNGE = 'athletes_lounge',
  COACHES_ROOM = 'coaches_room',
  REFEREE_ROOM = 'referee_room',
  SCOREBOARD_CONTROL = 'scoreboard_control',
  VIDEO_REVIEW = 'video_review',
  FIRST_AID = 'first_aid',
  PHYSIOTHERAPY = 'physiotherapy',
  OTHER = 'other',
}

export enum FacilityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_MAINTENANCE = 'under_maintenance',
  RENOVATION = 'renovation',
  DECOMMISSIONED = 'decommissioned',
  ARCHIVED = 'archived',
}

export enum FacilityAvailability {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  MAINTENANCE = 'maintenance',
  BLOCKED = 'blocked',
  RESERVED = 'reserved',
}

@Schema({ _id: false })
export class FacilityAddress {
  @ApiProperty()
  @Prop({ type: String, required: true })
  building: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  floor?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  roomNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  zone?: string;
}

@Schema({ _id: false })
export class FacilitySchedule {
  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  operatingDays: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  openTime?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  closeTime?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  timezone?: string;

  @ApiProperty({ required: false, type: [Object] })
  @Prop({ type: [Object], default: [] })
  exceptions?: Array<{
    date: Date;
    openTime?: string;
    closeTime?: string;
    reason?: string;
  }>;
}

@Schema({ _id: false })
export class FacilityAccessControl {
  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  authorizedRoles: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  authorizedOrganizations: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  requiresEscort: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  requiresAuthorization: boolean;
}

@Schema({ _id: false })
export class FacilityAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty()
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
export class FacilityArchive {
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
  collection: 'venue_facilities',
  timestamps: true,
  versionKey: 'version',
})
export class VenueFacility {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  facilityId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  facilityName: string;

  @ApiProperty({ enum: FacilityType })
  @Prop({ type: String, enum: FacilityType, required: true, index: true })
  facilityType: FacilityType;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ type: FacilityAddress })
  @Prop({ type: FacilityAddress, required: true })
  address: FacilityAddress;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 0 })
  capacity: number;

  @ApiProperty({ enum: FacilityStatus })
  @Prop({ type: String, enum: FacilityStatus, required: true, default: FacilityStatus.ACTIVE, index: true })
  status: FacilityStatus;

  @ApiProperty({ enum: FacilityAvailability })
  @Prop({ type: String, enum: FacilityAvailability, required: true, default: FacilityAvailability.AVAILABLE, index: true })
  availability: FacilityAvailability;

  @ApiProperty({ type: FacilitySchedule })
  @Prop({ type: FacilitySchedule, required: true })
  schedule: FacilitySchedule;

  @ApiProperty({ type: FacilityAccessControl })
  @Prop({ type: FacilityAccessControl, required: true })
  accessControl: FacilityAccessControl;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  equipment: string[];

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  amenities: string[];

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

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  accessibilityFeatures: string[];

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  safetyEquipment: string[];

  @ApiProperty({ type: FacilityAuditInfo })
  @Prop({ type: Object, required: true })
  audit: any;

  @ApiProperty({ type: FacilityArchive })
  @Prop({ type: Object, required: true })
  archive: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const VenueFacilitySchema = SchemaFactory.createForClass(VenueFacility);

// Indexes
VenueFacilitySchema.index({ facilityId: 1 }, { unique: true });
VenueFacilitySchema.index({ venueId: 1, facilityType: 1 });
VenueFacilitySchema.index({ venueId: 1, status: 1 });
VenueFacilitySchema.index({ facilityType: 1, status: 1 });
VenueFacilitySchema.index({ facilityId: 1 }, { unique: true });
VenueFacilitySchema.index({ 'address.building': 1, 'address.floor': 1, 'address.roomNumber': 1 });

// Virtual for isActive
VenueFacilitySchema.virtual('isActive').get(function() {
  return this.status === FacilityStatus.ACTIVE;
});

// Virtual for isAvailable
VenueFacilitySchema.virtual('isAvailable').get(function() {
  return this.status === FacilityStatus.ACTIVE && this.availability === 'available';
});

// Virtual for isUnderMaintenance
VenueFacilitySchema.virtual('isUnderMaintenance').get(function() {
  return this.status === FacilityStatus.UNDER_MAINTENANCE;
});