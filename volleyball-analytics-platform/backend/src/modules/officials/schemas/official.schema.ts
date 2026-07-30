import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type OfficialDocument = Official & Document;

export enum OfficialRole {
  FIRST_REFEREE = 'first_referee',
  SECOND_REFEREE = 'second_referee',
  CHALLENGE_REFEREE = 'challenge_referee',
  LINE_JUDGE = 'line_judge',
  SCORER = 'scorer',
  ASSISTANT_SCORER = 'assistant_scorer',
  COURT_MANAGER = 'court_manager',
  TECHNICAL_OFFICIAL = 'technical_official',
  MEDICAL_OFFICER = 'medical_officer',
  SUPERVISOR = 'supervisor',
}

export enum OfficialLevel {
  INTERNATIONAL = 'international',
  NATIONAL = 'national',
  REGIONAL = 'regional',
  STATE = 'state',
  LOCAL = 'local',
  CLUB = 'club',
  STUDENT = 'student',
}

export enum OfficialStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  RETIRED = 'retired',
  TRAINEE = 'trainee',
}

@Schema({ _id: false })
export class OfficialContact {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  email?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  phone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  address?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  emergencyContact?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  emergencyPhone?: string;
}

@Schema({ _id: false })
export class OfficialCertification {
  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  issuingBody: string;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  issuedDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  expiryDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  certificateNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  certificateUrl?: string;
}

@Schema({ _id: false })
export class OfficialAssignment {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true })
  matchId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  role: string;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  date: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  venue?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  competition?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  performanceRating?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;
}

@Schema({ _id: false })
export class OfficialStatistics {
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  totalMatches: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  matchesAsFirstReferee: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  matchesAsSecondReferee: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  matchesAsLineJudge: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  matchesAsScorer: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  averageRating: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  challengesHandled: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  challengesOverturned: number;
}

@Schema({ _id: false })
export class OfficialAvailability {
  @ApiProperty()
  @Prop({ type: Date, required: true })
  date: Date;

  @ApiProperty()
  @Prop({ type: Boolean, default: true })
  available: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  reason?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  preferredRole?: string;
}

@Schema({ _id: false })
export class OfficialAvailability {
  @ApiProperty()
  @Prop({ type: Date, required: true })
  date: Date;

  @ApiProperty()
  @Prop({ type: Boolean, default: true })
  available: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  reason?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  preferredRole?: string;
}

@Schema({ _id: false })
export class OfficialAuditInfo {
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
export class OfficialArchive {
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
  collection: 'officials',
  timestamps: true,
  versionKey: 'version',
})
export class Official {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  officialId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  firstName: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  lastName: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  middleName?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  displayName?: string;

  @ApiProperty({ enum: ['first_referee', 'second_referee', 'challenge_referee', 'line_judge', 'scorer', 'assistant_scorer', 'court_manager', 'technical_official', 'medical_officer', 'supervisor'] })
  @Prop({ type: String, enum: ['first_referee', 'second_referee', 'challenge_referee', 'line_judge', 'scorer', 'assistant_scorer', 'court_manager', 'technical_official', 'medical_officer', 'supervisor'], required: true, index: true })
  primaryRole: string;

  @ApiProperty({ type: [String], enum: ['first_referee', 'second_referee', 'challenge_referee', 'line_judge', 'scorer', 'assistant_scorer', 'court_manager', 'technical_official', 'medical_official', 'supervisor'] })
  @Prop({ type: [String], enum: ['first_referee', 'second_referee', 'challenge_referee', 'line_judge', 'scorer', 'assistant_scorer', 'court_manager', 'technical_official', 'medical_officer', 'supervisor'], default: [] })
  secondaryRoles: string[];

  @ApiProperty({ enum: ['international', 'national', 'regional', 'state', 'local', 'club', 'student'] })
  @Prop({ type: String, enum: ['international', 'national', 'regional', 'state', 'local', 'club', 'student'], required: true, index: true })
  level: string;

  @ApiProperty({ enum: ['active', 'inactive', 'suspended', 'retired', 'trainee'] })
  @Prop({ type: String, enum: ['active', 'inactive', 'suspended', 'retired', 'trainee'], required: true, default: 'active', index: true })
  status: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  dateOfBirth?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  nationality?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  federation?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  contact: {
    email?: string;
    phone?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  };

  @ApiProperty({ type: [Object] })
  @Prop({ type: [Object], default: [] })
  certifications: any[];

  @ApiProperty()
  @Prop({ type: Date })
  licenseExpiryDate?: Date;

  @ApiProperty({ type: [Object] })
  @Prop({ type: [Object], default: [] })
  assignments: any[];

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  statistics: {
    totalMatches: number;
    matchesAsFirstReferee: number;
    matchesAsSecondReferee: number;
    matchesAsLineJudge: number;
    matchesAsScorer: number;
    averageRating: number;
    challengesHandled: number;
    challengesOverturned: number;
  };

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  availability: any[];

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  preferences: {
    preferredRoles: string[];
    preferredCompetitions: Types.ObjectId[];
    maxMatchesPerWeek: number;
    maxTravelDistance: number;
    languages: string[];
  };

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  documents: {
    photoUrl?: string;
    cvUrl?: string;
    licenseUrl?: string;
    medicalCertificateUrl?: string;
    insuranceCertificateUrl?: string;
  };

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

export const OfficialSchema = SchemaFactory.createForClass(Official);

// Indexes
OfficialSchema.index({ officialId: 1 }, { unique: true });
OfficialSchema.index({ firstName: 1, lastName: 1 });
OfficialSchema.index({ primaryRole: 1, level: 1, status: 1 });
OfficialSchema.index({ status: 1 });
OfficialSchema.index({ level: 1 });
OfficialSchema.index({ 'contact.email': 1 });
OfficialSchema.index({ 'assignments.matchId': 1 });
OfficialSchema.index({ 'certifications.name': 1 });
OfficialSchema.index({ 'availability.date': 1, 'availability.available': 1 });

// Virtual for fullName
OfficialSchema.virtual('fullName').get(function() {
  const parts = [this.firstName, this.middleName, this.lastName].filter(Boolean);
  return parts.join(' ');
});

// Virtual for isActive
OfficialSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Virtual for isQualifiedForInternational
OfficialSchema.virtual('isInternationalLevel').get(function() {
  return this.level === 'international';
});

// Virtual for upcomingAssignments
OfficialSchema.virtual('upcomingAssignments').get(function() {
  const now = new Date();
  return this.assignments?.filter(a => new Date(a.date) >= new Date() && a.assignmentStatus === 'confirmed') || [];
};

// Virtual for pastAssignments
OfficialSchema.virtual('pastAssignments').get(function() {
  const now = new Date();
  return this.assignments?.filter(a => new Date(a.date) < now) || [];
});

// Virtual for upcomingAvailability
OfficialSchema.virtual('upcomingAvailability').get(function() {
  const now = new Date();
  return this.availability?.filter(a => new Date(a.date) >= now && a.available) || [];
});

// Virtual for expiredLicenses
OfficialSchema.virtual('isLicenseExpired').get(function() {
  if (!this.licenseExpiryDate) return false;
  return new Date(this.licenseExpiryDate) < new Date();
});

// Virtual for expiringCertifications
OfficialSchema.virtual('expiringCertifications').get(function() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.certifications?.filter(c => 
    c.expiryDate && new Date(c.expiryDate) <= thirtyDaysFromNow && new Date(c.expiryDate) >= new Date()
  ) || [];
});