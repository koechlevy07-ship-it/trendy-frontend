import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VenueConnectivityDocument = VenueConnectivity & Document;

export enum ConnectivityType {
  FIBER = 'fiber',
  COPPER = 'copper',
  WIRELESS = 'wireless',
  SATELLITE = 'satellite',
  MICROWAVE = 'microwave',
  POWERLINE = 'powerline',
  CELLULAR_5G = 'cellular_5g',
  CELLULAR_4G = 'cellular_4g',
  WIFI_6 = 'wifi_6',
  WIFI_6E = 'wifi_6e',
  WIFI_7 = 'wifi_7',
}

export enum ConnectivityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEGRADED = 'degraded',
  MAINTENANCE = 'maintenance',
  OUTAGE = 'outage',
  PLANNED = 'planned',
}

@Schema({ _id: false })
export class NetworkInterface {
  @ApiProperty()
  @Prop({ type: String, required: true })
  interfaceId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ enum: ['fiber', 'copper', 'wireless', 'satellite', 'microwave', 'powerline', 'cellular_5g', 'cellular_4g', 'wifi_6', 'wifi_6e', 'wifi_7'] })
  @Prop({ type: String, enum: ['fiber', 'copper', 'wireless', 'satellite', 'microwave', 'powerline', 'cellular_5g', 'cellular_4g', 'wifi_6', 'wifi_6e', 'wifi_7'], required: true })
  type: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  vendor?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  model?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  serialNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  ipAddress?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  subnetMask?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  gateway?: string;

  @ApiProperty({ required: false })
  @Prop({ type: [String] })
  dnsServers?: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  vlanId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  macAddress?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  location?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  portConfig?: Record<string, any>;
}

@Schema({ _id: false })
export class ConnectivityProvider {
  @ApiProperty()
  @Prop({ type: String, required: true })
  providerId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

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
  contractNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  contractExpiry?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  supportPhone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  supportEmail?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  slaDocumentUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  sla?: Record<string, any>;
}

@Schema({ _id: false })
export class ConnectivitySLA {
  @ApiProperty({ required: false })
  @Prop({ type: Number })
  uptimeGuarantee?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  maxLatencyMs?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  maxJitterMs?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  maxPacketLossPercent?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  minThroughputMbps?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  maxResponseTimeMs?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  supportTier?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  responseTimeMinutes?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  resolutionTimeMinutes?: number;
}

@Schema({ _id: false })
export class ConnectivityAuditInfo {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  version: number;
}

@Schema({ _id: false })
export class ConnectivityArchive {
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
  collection: 'venue_connectivity',
  timestamps: true,
  versionKey: 'version',
})
export class VenueConnectivity {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  connectivityId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  interfaces: any[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  providers: any[];

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  sla: any;

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  monitoringConfig?: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  audit: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  archive: any;

  @ApiProperty({ type: Object, default: {} })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const VenueConnectivitySchema = SchemaFactory.createForClass(VenueConnectivity);

// Indexes
VenueConnectivitySchema.index({ connectivityId: 1 }, { unique: true });
VenueConnectivitySchema.index({ venueId: 1 });
VenueConnectivitySchema.index({ 'interfaces.type': 1 });