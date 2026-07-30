import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VenueParkingDocument = VenueParking & Document;

export enum ParkingType {
  SURFACE = 'surface',
  STRUCTURE = 'structure',
  UNDERGROUND = 'underground',
  ROOFTOP = 'rooftop',
  VALET = 'valet',
  STREET = 'street',
  OFF_SITE = 'off_site',
  RESERVED = 'reserved',
  VIP = 'vip',
  ACCESSIBLE = 'accessible',
  ELECTRIC = 'electric',
  BUS = 'bus',
  MOTORCYCLE = 'motorcycle',
  BICYCLE = 'bicycle',
  OTHER = 'other',
}

export enum ParkingStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_MAINTENANCE = 'under_maintenance',
  FULL = 'full',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export enum ParkingAccessType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PERMIT = 'permit',
  PAID = 'paid',
  PERMIT_PAID = 'permit_paid',
  FREE = 'free',
  SUBSCRIPTION = 'subscription',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile',
  CONTACTLESS = 'contactless',
  APP = 'app',
  PREPAID = 'prepaid',
  SUBSCRIPTION = 'subscription',
  FREE = 'free',
}

@Schema({ _id: false })
export class ParkingSpot {
  @ApiProperty()
  @Prop({ type: String, required: true })
  spotId: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  spotNumber?: string;

  @ApiProperty({ enum: ['standard', 'compact', 'accessible', 'electric', 'vip', 'bus', 'motorcycle', 'bicycle', 'reserved'] })
  @Prop({ type: String, enum: ['standard', 'compact', 'accessible', 'electric', 'vip', 'bus', 'motorcycle', 'bicycle', 'reserved'], required: true })
  type: string;

  @ApiProperty({ enum: ['available', 'occupied', 'reserved', 'maintenance', 'blocked'] })
  @Prop({ type: String, enum: ['available', 'occupied', 'reserved', 'maintenance', 'blocked'], required: true, default: 'available' })
  status: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  assignedTo?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  assignedToUserId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  reservationId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  reservedUntil?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  position?: {
    x: number;
    y: number;
    level: number;
  };
}

@Schema({ _id: false })
export class ParkingRate {
  @ApiProperty()
  @Prop({ type: String, required: true })
  period: string;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 0 })
  rate: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  currency?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  includesTax: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;
}

@Schema({ _id: false })
export class ParkingPaymentConfig {
  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  acceptedMethods: string[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  paymentTerminals: any[];

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  contactlessEnabled: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  mobilePaymentEnabled: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  paymentGateway?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  merchantId?: string;
}

@Schema({ _id: false })
export class ParkingAccessControl {
  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  authorizedVehicles: string[];

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  authorizedUsers: string[];

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  permitTypes: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  accessSystem?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  requiresReservation: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  maxStayHours?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  overtimeAllowed: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  overtimeRate?: number;
}

@Schema({ _id: false })
export class ParkingFacility {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  name?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  type?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  capacity?: number;

  @ApiProperty({ required: false })
  @Prop({ type: [Object], default: [] })
  spots: any[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  entrance?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  exit?: string;
}

@Schema({ _id: false })
export class ParkingAuditInfo {
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
export class ParkingArchive {
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
  collection: 'venue_parking',
  timestamps: true,
  versionKey: 'version',
})
export class VenueParking {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  parkingId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ enum: ['surface', 'structure', 'underground', 'rooftop', 'valet', 'street', 'off_site', 'reserved', 'vip', 'accessible', 'electric', 'bus', 'motorcycle', 'bicycle', 'other'] })
  @Prop({ type: String, enum: ['surface', 'structure', 'underground', 'rooftop', 'valet', 'street', 'off_site', 'reserved', 'vip', 'accessible', 'electric', 'bus', 'motorcycle', 'bicycle', 'other'], required: true, index: true })
  type: string;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 0 })
  totalCapacity: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  availableCapacity?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number, min: 0 })
  occupiedCapacity?: number;

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  spots: any[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  facilities: any[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  rates: any[];

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  paymentConfig: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  accessControl: any;

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  facilities: any[];

  @ApiProperty({ enum: ['active', 'inactive', 'under_maintenance', 'full', 'closed', 'archived'] })
  @Prop({ type: String, enum: ['active', 'inactive', 'under_maintenance', 'full', 'closed', 'archived'], required: true, default: 'active', index: true })
  status: string;

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

export const VenueParkingSchema = SchemaFactory.createForClass(VenueParking);

// Indexes
VenueParkingSchema.index({ parkingId: 1 }, { unique: true });
VenueParkingSchema.index({ venueId: 1, status: 1 });
VenueParkingSchema.index({ status: 1 });
VenueParkingSchema.index({ 'spots.status': 1 });

// Virtual for occupancyRate
VenueParkingSchema.virtual('occupancyRate').get(function() {
  if (this.totalCapacity === 0) return 0;
  return (this.occupiedCapacity / this.totalCapacity) * 100;
});

// Virtual for isFull
VenueParkingSchema.virtual('isFull').get(function() {
  return this.occupiedCapacity >= this.totalCapacity;
});

// Virtual for availableSpots
VenueParkingSchema.virtual('availableSpots').get(function() {
  return this.totalCapacity - this.occupiedCapacity;
});

// Virtual for isAvailable
VenueParkingSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.occupiedCapacity < this.totalCapacity;
});