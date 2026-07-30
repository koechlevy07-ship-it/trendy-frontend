import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VenueCertificationDocument = VenueCertification & Document;

export enum CertificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  RENEWAL_PENDING = 'renewal_pending',
}

export enum CertificationType {
  INTERNATIONAL_COMPETITION = 'international_competition',
  NATIONAL_LEAGUE = 'national_league',
  REGIONAL_CHAMPIONSHIP = 'regional_championship',
  YOUTH_COMPETITION = 'youth_competition',
  BEACH_VOLLEYBALL = 'beach_volleyball',
  SITTING_VOLLEYBALL = 'sitting_volleyball',
  TRAINING_FACILITY = 'training_facility',
  REFEREE_TRAINING = 'referee_training',
  COACH_EDUCATION = 'coach_education',
  MEDICAL_FACILITY = 'medical_facility',
  BROADCAST_CAPABLE = 'broadcast_capable',
  AI_CAMERA_CERTIFIED = 'ai_camera_certified',
}

@Schema({ _id: false })
export class CertificationAuthority {
  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  acronym?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  country?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  website?: string;
}

@Schema({ _id: false })
export class CertificationDocument {
  @ApiProperty()
  @Prop({ type: String, required: true })
  documentId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  type: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  fileUrl: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  mimeType: string;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  fileSize: number;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  uploadedAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  uploadedBy?: Types.ObjectId;
}

@Schema({ _id: false })
export class CertificationCondition {
  @ApiProperty()
  @Prop({ type: String, required: true })
  condition: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  dueDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  isMet: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  metAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  metBy?: Types.ObjectId;
}

@Schema({ _id: false })
export class CertificationAudit {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
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
export class CertificationArchive {
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
  collection: 'venue_certifications',
  timestamps: true,
  versionKey: 'version',
})
export class VenueCertification {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  certificationId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty({ enum: CertificationType })
  @Prop({ type: String, enum: CertificationType, required: true, index: true })
  type: CertificationType;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ type: CertificationAuthority })
  @Prop({ type: CertificationAuthority, required: true })
  authority: CertificationAuthority;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  issuedDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  expiryDate?: Date;

  @ApiProperty({ enum: CertificationStatus })
  @Prop({ type: String, enum: CertificationStatus, required: true, default: CertificationStatus.PENDING, index: true })
  status: CertificationStatus;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  certificateNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  certificateUrl?: string;

  @ApiProperty({ type: [CertificationDocument] })
  @Prop({ type: [CertificationDocument], default: [] })
  documents: CertificationDocument[];

  @ApiProperty({ type: [CertificationCondition], default: [] })
  @Prop({ type: [CertificationCondition], default: [] })
  conditions: CertificationCondition[];

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  scope: string[];

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  restrictions: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  renewalReminderDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  lastRenewalDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Number, default: 0 })
  renewalCount: number;

  @ApiProperty({ type: CertificationAudit })
  @Prop({ type: CertificationAudit, required: true })
  audit: CertificationAudit;

  @ApiProperty({ type: CertificationArchive })
  @Prop({ type: CertificationArchive, required: true })
  archive: CertificationArchive;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const VenueCertificationSchema = SchemaFactory.createForClass(VenueCertification);

// Indexes
VenueCertificationSchema.index({ venueId: 1, type: 1 });
VenueCertificationSchema.index({ venueId: 1, status: 1 });
VenueCertificationSchema.index({ certificationId: 1 }, { unique: true });
VenueCertificationSchema.index({ status: 1 });
VenueCertificationSchema.index({ expiryDate: 1 });
VenueCertificationSchema.index({ 'authority.name': 1 });

// Virtual for isValid
VenueCertificationSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'approved' && 
         (!this.expiryDate || this.expiryDate > now);
});

// Virtual for isExpiringSoon
VenueCertificationSchema.virtual('isExpiringSoon').get(function() {
  if (!this.expiryDate) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.expiryDate <= thirtyDaysFromNow && this.status === 'approved';
});