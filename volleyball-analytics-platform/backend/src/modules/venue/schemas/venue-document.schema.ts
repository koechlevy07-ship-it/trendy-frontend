import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VenueDocumentDocument = VenueDocument & Document;

export enum DocumentType {
  CONTRACT = 'contract',
  AGREEMENT = 'agreement',
  LEASE = 'lease',
  DEED = 'deed',
  TITLE = 'title',
  PERMIT = 'permit',
  LICENSE = 'license',
  CERTIFICATE = 'certificate',
  INSURANCE = 'insurance',
  INSPECTION_REPORT = 'inspection_report',
  ENGINEERING_REPORT = 'engineering_report',
  ENVIRONMENTAL_REPORT = 'environmental_report',
  SAFETY_REPORT = 'safety_report',
  ACCESSIBILITY_REPORT = 'accessibility_report',
  FIRE_SAFETY_REPORT = 'fire_safety_report',
  STRUCTURAL_REPORT = 'structural_report',
  ELECTRICAL_REPORT = 'electrical_report',
  PLUMBING_REPORT = 'plumbing_report',
  HVAC_REPORT = 'hvac_report',
  FIRE_SUPPRESSION_REPORT = 'fire_suppression_report',
  ACOUSTIC_REPORT = 'acoustic_report',
  LIGHTING_REPORT = 'lighting_report',
  ENERGY_AUDIT = 'energy_audit',
  SUSTAINABILITY_REPORT = 'sustainability_report',
  ACCESSIBILITY_AUDIT = 'accessibility_audit',
  CODE_COMPLIANCE = 'code_compliance',
  ZONING_APPROVAL = 'zoning_approval',
  BUILDING_PERMIT = 'building_permit',
  OCCUPANCY_PERMIT = 'occupancy_permit',
  FIRE_MARSHAL_APPROVAL = 'fire_marshal_approval',
  HEALTH_DEPARTMENT_APPROVAL = 'health_department_approval',
  ENVIRONMENTAL_PERMIT = 'environmental_permit',
  WASTE_MANAGEMENT = 'waste_management',
  HAZARDOUS_MATERIALS = 'hazardous_materials',
  ASBESTOS_REPORT = 'asbestos_report',
  LEAD_PAINT_REPORT = 'lead_paint_report',
  RADON_TEST = 'radon_test',
  WATER_QUALITY = 'water_quality',
  AIR_QUALITY = 'air_quality',
  NOISE_ASSESSMENT = 'noise_assessment',
  TRAFFIC_IMPACT = 'traffic_impact',
  PARKING_STUDY = 'parking_study',
  ACCESSIBILITY_PLAN = 'accessibility_plan',
  EVACUATION_PLAN = 'evacuation_plan',
  EMERGENCY_PLAN = 'emergency_plan',
  SECURITY_PLAN = 'security_plan',
  BUSINESS_CONTINUITY = 'business_continuity',
  INSURANCE_CERTIFICATE = 'insurance_certificate',
  LIABILITY_WAIVER = 'liability_waiver',
  INDEMNITY_AGREEMENT = 'indemnity_agreement',
  HOLD_HARMLESS = 'hold_harmless',
  NDA = 'nda',
  MOU = 'mou',
  SERVICE_AGREEMENT = 'service_agreement',
  MAINTENANCE_CONTRACT = 'maintenance_contract',
  VENDOR_AGREEMENT = 'vendor_agreement',
  SPONSORSHIP_AGREEMENT = 'sponsorship_agreement',
  BROADCAST_AGREEMENT = 'broadcast_agreement',
  STREAMING_RIGHTS = 'streaming_rights',
  MEDIA_RIGHTS = 'media_rights',
  NAMING_RIGHTS = 'naming_rights',
  ADVERTISING_AGREEMENT = 'advertising_agreement',
  CONCESSION_AGREEMENT = 'concession_agreement',
  FOOD_SERVICE = 'food_service',
  MERCHANDISE_AGREEMENT = 'merchandise_agreement',
  TICKETING_AGREEMENT = 'ticketing_agreement',
  PARKING_AGREEMENT = 'parking_agreement',
  TRANSPORTATION_AGREEMENT = 'transportation_agreement',
  SECURITY_AGREEMENT = 'security_agreement',
  EMERGENCY_SERVICES = 'emergency_services',
  MEDICAL_SERVICES = 'medical_services',
  CATERING_AGREEMENT = 'catering_agreement',
  CLEANING_CONTRACT = 'cleaning_contract',
  SECURITY_CONTRACT = 'security_contract',
  LANDSCAPING_CONTRACT = 'landscaping_contract',
  SNOW_REMOVAL = 'snow_removal',
  WASTE_MANAGEMENT = 'waste_management',
  RECYCLING_CONTRACT = 'recycling_contract',
  HAZARDOUS_WASTE = 'hazardous_waste',
  UTILITY_AGREEMENT = 'utility_agreement',
  ELECTRIC_SERVICE = 'electric_service',
  GAS_SERVICE = 'gas_service',
  WATER_SERVICE = 'water_service',
  SEWER_SERVICE = 'sewer_service',
  TELECOM_SERVICE = 'telecom_service',
  INTERNET_SERVICE = 'internet_service',
  CABLE_SERVICE = 'cable_service',
  SATELLITE_SERVICE = 'satellite_service',
  OTHER = 'other',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUPERSEDED = 'superseded',
  ARCHIVED = 'archived',
}

export enum DocumentVisibility {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  CLASSIFIED = 'classified',
}

@Schema({ _id: false })
export class DocumentVersion {
  @ApiProperty()
  @Prop({ type: String, required: true })
  version: string;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  effectiveDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  expiryDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  changeSummary?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  changeReason?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  fileUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  checksum?: string;
}

@Schema({ _id: false })
export class DocumentReview {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, required: true })
  reviewedBy: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  reviewedAt: Date;

  @ApiProperty({ enum: ['approved', 'rejected', 'changes_requested', 'commented'] })
  @Prop({ type: String, enum: ['approved', 'rejected', 'changes_requested', 'commented'], required: true })
  decision: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  comments?: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  requiredChanges: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  completedAt?: Date;
}

@Schema({ _id: false })
export class DocumentAccess {
  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  readAccess: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  writeAccess: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  adminAccess: Types.ObjectId[];

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  authorizedRoles: string[];

  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  authorizedGroups: Types.ObjectId[];

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  isPublic: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: false })
  requiresAuthentication: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  passwordHint?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  expiresAt?: Date;
}

@Schema({ _id: false })
export class DocumentVersion {
  @ApiProperty()
  @Prop({ type: String, required: true })
  version: string;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  createdAt: Date;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  fileUrl: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  changeSummary?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  checksum?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  fileSize?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  mimeType?: string;
}

@Schema({ _id: false })
export class DocumentAuditInfo {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  reviewedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  approvedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  rejectedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  archivedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  deletedBy?: Types.ObjectId;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  version: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  auditReference?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  changeReason?: string;
}

@Schema({ _id: false })
export class DocumentArchive {
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
  collection: 'venue_documents',
  timestamps: true,
  versionKey: 'version',
})
export class VenueDocument {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  documentId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Court' })
  courtId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Facility' })
  facilityId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Equipment' })
  equipmentId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  referenceNumber?: string;

  @ApiProperty({ enum: DocumentType })
  @Prop({ type: String, enum: DocumentType, required: true, index: true })
  type: DocumentType;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  category?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  subCategory?: string;

  @ApiProperty({ enum: DocumentStatus })
  @Prop({ type: String, enum: DocumentStatus, required: true, default: DocumentStatus.DRAFT, index: true })
  status: DocumentStatus;

  @ApiProperty({ enum: DocumentVisibility })
  @Prop({ type: String, enum: DocumentVisibility, required: true, default: DocumentVisibility.INTERNAL, index: true })
  visibility: DocumentVisibility;

  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  relatedEntities: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  relatedDocuments: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  supersededDocuments: Types.ObjectId[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  fileUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  fileName?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  originalFileName?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  mimeType?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  fileSize?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  checksum?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  checksumAlgorithm?: string;

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

  @ApiProperty({ type: [DocumentVersion], default: [] })
  @Prop({ type: [DocumentVersion], default: [] })
  versions: DocumentVersion[];

  @ApiProperty({ type: [DocumentReview], default: [] })
  @Prop({ type: [DocumentReview], default: [] })
  reviews: DocumentReview[];

  @ApiProperty({ type: DocumentAccess })
  @Prop({ type: DocumentAccess, required: true })
  access: DocumentAccess;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  effectiveDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  expiryDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  reviewDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  owner?: Types.ObjectId;

  @ApiProperty({ type: [Types.ObjectId], default: [] })
  @Prop({ type: [Types.ObjectId], default: [] })
  responsibleParties: Types.ObjectId[];

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastReviewedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  lastReviewedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Number, default: 0 })
  reviewCount: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  retentionPolicy?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  destructionDate?: Date;

  @ApiProperty({ type: Object, required: true })
  audit: any;

  @ApiProperty({ type: Object, required: true })
  archive: any;

  @ApiProperty({ type: Object, default: {} })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const VenueDocumentSchema = SchemaFactory.createForClass(VenueDocument);

// Indexes
VenueDocumentSchema.index({ documentId: 1 }, { unique: true });
VenueDocumentSchema.index({ venueId: 1, type: 1 });
VenueDocumentSchema.index({ venueId: 1, status: 1 });
VenueDocumentSchema.index({ venueId: 1, status: 1, type: 1 });
VenueDocumentSchema.index({ type: 1, status: 1 });
VenueDocumentSchema.index({ status: 1 });
VenueDocumentSchema.index({ visibility: 1 });
VenueDocumentSchema.index({ title: 'text', description: 'text', tags: 'text', keywords: 'text' });
VenueDocumentSchema.index({ documentId: 1 }, { unique: true });
VenueDocumentSchema.index({ expiryDate: 1, status: 1 });
VenueDocumentSchema.index({ reviewDate: 1, status: 1 });
VenueDocumentSchema.index({ 'access.readAccess': 1 });
VenueDocumentSchema.index({ 'access.writeAccess': 1 });
VenueDocumentSchema.index({ 'access.authorizedRoles': 1 });
VenueDocumentSchema.index({ effectiveDate: 1, expiryDate: 1 });
VenueDocumentSchema.index({ expiryDate: 1, status: 1 });
VenueDocumentSchema.index({ reviewDate: 1, status: 1 });

// Virtual for isExpired
VenueDocumentSchema.virtual('isExpired').get(function() {
  return this.expiryDate && this.expiryDate < new Date();
});

// Virtual for isExpiringSoon
VenueDocumentSchema.virtual('isExpiringSoon').get(function() {
  if (!this.expiryDate) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.expiryDate <= thirtyDaysFromNow && this.status === DocumentStatus.APPROVED;
});

// Virtual for isReviewDue
VenueDocumentSchema.virtual('isReviewDue').get(function() {
  if (!this.reviewDate) return false;
  return this.reviewDate <= new Date() && this.status === DocumentStatus.APPROVED;
});

// Virtual for isFinal
VenueDocumentSchema.virtual('isFinal').get(function() {
  return this.status === DocumentStatus.APPROVED && this.visibility === 'public';
});

// Virtual for versionCount
VenueDocumentSchema.virtual('versionCount').get(function() {
  return this.versions?.length || 0;
});

// Virtual for hasPendingReviews
VenueDocumentSchema.virtual('hasPendingReviews').get(function() {
  return this.reviews?.some(r => r.decision === 'changes_requested') || false;
});

// Virtual for isSuperseded
VenueDocumentSchema.virtual('isSuperseded').get(function() {
  return this.status === 'superseded';
});