/**
 * Organization Schemas - Chapter 11 Part 1
 * 
 * Mongoose schemas for Organization, Team, and related entities.
 * These define the domain models for the Team & Organization Management Module.
 * 
 * Note: These are architectural definitions. Part 2 will implement the actual Mongoose schemas.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

// ============================================================================
// ENUMS
// ============================================================================

export enum OrganizationType {
  FEDERATION = 'federation',
  LEAGUE = 'league',
  CLUB = 'club',
  ACADEMY = 'academy',
  SCHOOL = 'school',
  UNIVERSITY = 'university',
  REGIONAL = 'regional',
  NATIONAL_TEAM = 'national_team',
  NATIONAL_FEDERATION = 'national_federation',
  REGIONAL_FEDERATION = 'regional_federation',
  AMATEUR_LEAGUE = 'amateur_league',
  PROFESSIONAL_LEAGUE = 'professional_league',
}

export enum OrganizationStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
  DISSOLVED = 'dissolved',
}

export enum TeamCategory {
  SENIOR_MEN = 'senior_men',
  SENIOR_WOMEN = 'senior_women',
  U23 = 'u23',
  U21 = 'u21',
  U19 = 'u19',
  U17 = 'u17',
  YOUTH = 'youth',
  JUNIOR = 'junior',
  PARA_VOLLEYBALL = 'para_volleyball',
  BEACH_VOLLEYBALL = 'beach_volleyball',
  SITTING_VOLLEYBALL = 'sitting_volleyball',
  DEVELOPMENT = 'development',
  ACADEMY = 'academy',
  RECREATIONAL = 'recreational',
}

export enum TeamGender {
  MEN = 'men',
  WOMEN = 'women',
  COED = 'coed',
}

export enum TeamStatus {
  REGISTERING = 'registering',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
  DISBANDED = 'disbanded',
}

// ============================================================================
// SUB-DOCUMENT SCHEMAS
// ============================================================================

export class OrganizationAddress {
  @ApiProperty()
  street: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  stateProvince: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty({ required: false })
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export class OrganizationContact {
  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  website?: string;

  @ApiProperty({ required: false })
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export class OrganizationBranding {
  @ApiProperty({ required: false })
  primaryColor?: string;

  @ApiProperty({ required: false })
  secondaryColor?: string;

  @ApiProperty({ required: false })
  accentColor?: string;

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  logoDarkUrl?: string;

  @ApiProperty({ required: false })
  logoLightUrl?: string;

  @ApiProperty({ required: false })
  faviconUrl?: string;

  @ApiProperty({ required: false })
  bannerUrl?: string;

  @ApiProperty({ required: false })
  brandingGuidelinesUrl?: string;
}

export class AIMetadata {
  @ApiProperty({ required: false, type: [Number] })
  organizationEmbedding?: number[];

  @ApiProperty({ required: false })
  teamColorProfile?: {
    primary: number[];
    secondary: number[];
    accent: number[];
  };

  @ApiProperty({ required: false })
  jerseyTemplates?: {
    home?: { pattern: string; colors: string[] };
    away?: { pattern: string; colors: string[] };
    alternate?: { pattern: string; colors: string[] };
  };

  @ApiProperty({ required: false, type: [String] })
  logoReferences?: string[];

  @ApiProperty({ required: false })
  courtPreferences?: {
    defaultCourtType?: string;
    preferredLighting?: string;
    cameraPositions?: number[][];
  };
}

export class OrganizationRegistration {
  @ApiProperty()
  registrationNumber: string;

  @ApiProperty()
  registrationDate: Date;

  @ApiProperty()
  registrationAuthority: string;

  @ApiProperty({ required: false })
  licenseNumber?: string;

  @ApiProperty({ required: false })
  licenseExpiry?: Date;

  @ApiProperty({ required: false })
  verificationDocuments?: string[];

  @ApiProperty({ required: false })
  verifiedBy?: string;

  @ApiProperty({ required: false })
  verifiedAt?: Date;
}

// ============================================================================
// ORGANIZATION MAIN SCHEMA
// ============================================================================

export interface OrganizationDocument extends Document {
  _id: Types.ObjectId;
  organizationId: string;
  name: string;
  shortName: string;
  displayName: string;
  type: OrganizationType;
  status: OrganizationStatus;
  parentOrganizationId?: Types.ObjectId;
  governingBodyId?: Types.ObjectId;
  governingBodyName?: string;
  affiliationDate?: Date;
  governanceTier: number;
  registration: OrganizationRegistration;
  address: OrganizationAddress;
  contact: OrganizationContact;
  branding: OrganizationBranding;
  aiMetadata: AIMetadata;
  teamIds: Types.ObjectId[];
  facilityIds: Types.ObjectId[];
  documentIds: Types.ObjectId[];
  licenseIds: Types.ObjectId[];
  competitionMemberships: Types.ObjectId[];
  tenantId: string;
  dataRegion: string;
  version: number;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

@Schema({ 
  collection: 'organizations',
  timestamps: true,
  versionKey: 'version',
})
export class Organization {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  organizationId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true, maxlength: 20 })
  shortName: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  displayName: string;

  @ApiProperty({ enum: OrganizationType })
  @Prop({ type: String, enum: OrganizationType, required: true, index: true })
  type: OrganizationType;

  @ApiProperty({ enum: OrganizationStatus })
  @Prop({ type: String, enum: OrganizationStatus, required: true, default: OrganizationStatus.PENDING_VERIFICATION, index: true })
  status: OrganizationStatus;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: false, index: true })
  parentOrganizationId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  governingBodyId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  governingBodyName?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  affiliationDate?: Date;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0, min: 0, max: 5 })
  governanceTier: number;

  @ApiProperty({ type: () => OrganizationRegistration })
  @Prop({ type: OrganizationRegistration, required: true })
  registration: OrganizationRegistration;

  @ApiProperty({ type: () => OrganizationAddress })
  @Prop({ type: OrganizationAddress, required: true })
  address: OrganizationAddress;

  @ApiProperty({ type: () => OrganizationContact })
  @Prop({ type: OrganizationContact, required: true })
  contact: OrganizationContact;

  @ApiProperty({ type: () => OrganizationBranding })
  @Prop({ type: OrganizationBranding, required: true })
  branding: OrganizationBranding;

  @ApiProperty({ type: () => AIMetadata })
  @Prop({ type: AIMetadata, required: true })
  aiMetadata: AIMetadata;

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Team' }], default: [] })
  teamIds: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'Facility', default: [] })
  facilityIds: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], default: [] })
  documentIds: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'License', default: [] })
  licenseIds: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'Competition', default: [] })
  competitionMemberships: Types.ObjectId[];

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  tenantId: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false, default: 'global' })
  dataRegion: string;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  version: number;

  @ApiProperty()
  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  deletedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, required: false })
  deletedBy?: Types.ObjectId;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

// Indexes
OrganizationSchema.index({ tenantId: 1, status: 1 });
OrganizationSchema.index({ tenantId: 1, type: 1 });
OrganizationSchema.index({ tenantId: 1, parentOrganizationId: 1 });
OrganizationSchema.index({ organizationId: 1 }, { unique: true });
OrganizationSchema.index({ 'registration.registrationNumber': 1 }, { unique: true, sparse: true });
OrganizationSchema.index({ name: 'text', shortName: 'text', displayName: 'text' });

// Virtual for full hierarchy path
OrganizationSchema.virtual('hierarchyPath', {
  ref: 'Organization',
  localField: 'parentOrganizationId',
  foreignField: '_id',
  justOne: true,
});

// ============================================================================
// TEAM SCHEMAS
// ============================================================================

export enum TeamCategory {
  SENIOR_MEN = 'senior_men',
  SENIOR_WOMEN = 'senior_women',
  U23 = 'u23',
  U21 = 'u21',
  U19 = 'u19',
  U17 = 'u17',
  YOUTH = 'youth',
  JUNIOR = 'junior',
  PARA_VOLLEYBALL = 'para_volleyball',
  BEACH_VOLLEYBALL = 'beach_volleyball',
  SITTING_VOLLEYBALL = 'sitting_volleyball',
  DEVELOPMENT = 'development',
  ACADEMY = 'academy',
  RECREATIONAL = 'recreational',
}

export enum TeamGender {
  MEN = 'men',
  WOMEN = 'women',
  COED = 'coed',
}

export enum TeamStatus {
  REGISTERING = 'registering',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
  DISBANDED = 'disbanded',
}

export class TeamRosterEntry {
  @ApiProperty()
  playerId: Types.ObjectId;

  @ApiProperty()
  playerName: string;

  @ApiProperty()
  jerseyNumber: number;

  @ApiProperty()
  position: string;

  @ApiProperty()
  joinedDate: Date;

  @ApiProperty({ required: false })
  leftDate?: Date;

  @ApiProperty({ required: false })
  isActive?: boolean;

  @ApiProperty({ required: false })
  isCaptain?: boolean;

  @ApiProperty({ required: false })
  isLibero?: boolean;
}

export class TeamCoachingStaffEntry {
  @ApiProperty()
  staffId: Types.ObjectId;

  @ApiProperty()
  staffName: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty({ required: false })
  endDate?: Date;

  @ApiProperty({ required: false })
  isHeadCoach?: boolean;
}

export class TeamSeasonRecord {
  @ApiProperty()
  seasonId: Types.ObjectId;

  @ApiProperty()
  seasonName: string;

  @ApiProperty()
  leagueId: Types.ObjectId;

  @ApiProperty()
  leagueName: string;

  @ApiProperty()
  division?: string;

  @ApiProperty()
  finalStanding?: number;

  @ApiProperty()
  matchesPlayed: number;

  @ApiProperty()
  wins: number;

  @ApiProperty()
  losses: number;

  @ApiProperty({ required: false })
  draws?: number;

  @ApiProperty({ required: false })
  pointsFor?: number;

  @ApiProperty({ required: false })
  pointsAgainst?: number;

  @ApiProperty({ required: false })
  rosterSnapshot?: Types.ObjectId[];
}

export class TeamRosterSnapshot {
  @ApiProperty()
  seasonId: Types.ObjectId;

  @ApiProperty()
  seasonName: string;

  @ApiProperty({ type: [Object] })
  players: TeamRosterEntry[];

  @ApiProperty({ type: [Object] })
  coachingStaff: TeamCoachingStaffEntry[];

  @ApiProperty()
  snapshotDate: Date;
}

export class TeamBranding {
  @ApiProperty({ required: false })
  primaryColor?: string;

  @ApiProperty({ required: false })
  secondaryColor?: string;

  @ApiProperty({ required: false })
  accentColor?: string;

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  mascot?: string;

  @ApiProperty({ required: false })
  nickname?: string;

  @ApiProperty({ required: false })
  motto?: string;
}

export class TeamAIMetadata {
  @ApiProperty({ required: false, type: [Number] })
  teamEmbedding?: number[];

  @ApiProperty({ required: false })
  jerseyRecognition?: {
    home?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    away?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    alternate?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    goalkeeper?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
  };

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  teamPhotoUrl?: string;

  @ApiProperty({ required: false })
  courtSidePreference?: 'left' | 'right' | 'no_preference';

  @ApiProperty({ required: false, minimum: 0, maximum: 1 })
  recognitionConfidenceThreshold?: number;
}

export interface TeamDocument extends Document {
  _id: Types.ObjectId;
  teamId: string;
  name: string;
  shortName: string;
  displayName: string;
  organizationId: Types.ObjectId;
  category: TeamCategory;
  gender: TeamGender;
  status: TeamStatus;
  division?: string;
  level?: string;
  foundingDate?: Date;
  foundingSeason?: string;
  activeRoster: TeamRosterEntry[];
  historicalRoster: TeamRosterEntry[];
  coachingStaff: TeamCoachingStaffEntry[];
  leagueIds: Types.ObjectId[];
  currentSeasonId?: Types.ObjectId;
  seasonHistory: TeamSeasonRecord[];
  aiMetadata: TeamAIMetadata;
  branding?: TeamBranding;
  statisticsProfileId?: Types.ObjectId;
  medicalProfileId?: Types.ObjectId;
  trainingProgramId?: Types.ObjectId;
  scheduleId?: Types.ObjectId;
  tenantId: string;
  version: number;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

@Schema({
  collection: 'teams',
  timestamps: true,
  versionKey: 'version',
})
export class Team {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  teamId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true, maxlength: 10 })
  shortName: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  displayName: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @ApiProperty({ enum: TeamCategory })
  @Prop({ type: String, enum: TeamCategory, required: true, index: true })
  category: TeamCategory;

  @ApiProperty({ enum: TeamGender })
  @Prop({ type: String, enum: TeamGender, required: true, index: true })
  gender: TeamGender;

  @ApiProperty({ enum: TeamStatus })
  @Prop({ type: String, enum: TeamStatus, required: true, default: TeamStatus.REGISTERING, index: true })
  status: TeamStatus;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  division?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  level?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  foundingDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  foundingSeason?: string;

  @ApiProperty({ type: [TeamRosterEntry] })
  @Prop({ type: [TeamRosterEntry], default: [] })
  activeRoster: TeamRosterEntry[];

  @ApiProperty({ type: [TeamRosterEntry] })
  @Prop({ type: [TeamRosterEntry], default: [] })
  historicalRoster: TeamRosterEntry[];

  @ApiProperty({ type: [TeamCoachingStaffEntry] })
  @Prop({ type: [TeamCoachingStaffEntry], default: [] })
  coachingStaff: TeamCoachingStaffEntry[];

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'League', default: [] })
  leagueIds: Types.ObjectId[];

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Season', required: false })
  currentSeasonId?: Types.ObjectId;

  @ApiProperty({ type: [TeamSeasonRecord] })
  @Prop({ type: [TeamSeasonRecord], default: [] })
  seasonHistory: TeamSeasonRecord[];

  @ApiProperty({ type: () => TeamAIMetadata })
  @Prop({ type: TeamAIMetadata, required: true })
  aiMetadata: TeamAIMetadata;

  @ApiProperty({ type: () => TeamBranding, required: false })
  @Prop({ type: TeamBranding, required: false })
  branding?: TeamBranding;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'StatisticsProfile', required: false })
  statisticsProfileId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'MedicalProfile', required: false })
  medicalProfileId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'TrainingProgram', required: false })
  trainingProgramId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Schedule', required: false })
  scheduleId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  tenantId: string;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  version: number;

  @ApiProperty()
  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  deletedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, required: false })
  deletedBy?: Types.ObjectId;
}

export const TeamSchema = SchemaFactory.createForClass(Team);

// Indexes
TeamSchema.index({ tenantId: 1, organizationId: 1 });
TeamSchema.index({ tenantId: 1, category: 1, gender: 1 });
TeamSchema.index({ tenantId: 1, status: 1 });
TeamSchema.index({ teamId: 1 }, { unique: true });
TeamSchema.index({ name: 'text', shortName: 'text', displayName: 'text' });
TeamSchema.index({ organizationId: 1, status: 1 });

// ============================================================================
// HISTORICAL RECORD SCHEMAS (Immutable after archival)
// ============================================================================

export interface OrganizationHistoricalRecordDocument extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  organizationName: string;
  recordType: 'created' | 'updated' | 'status_changed' | 'parent_changed' | 'branding_updated' | 'registration_updated' | 'suspended' | 'archived' | 'restored' | 'dissolved';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedBy: Types.ObjectId;
  changedAt: Date;
  correlationId?: string;
  remarks?: string;
}

@Schema({ collection: 'organization_historical_records', timestamps: true })
export class OrganizationHistoricalRecord {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: String, required: true })
  organizationName: string;

  @Prop({ 
    type: String, 
    enum: ['created', 'updated', 'status_changed', 'parent_changed', 'branding_updated', 'registration_updated', 'suspended', 'archived', 'restored', 'dissolved'],
    required: true 
  })
  recordType: string;

  @Prop({ type: Object, required: false })
  oldValues?: Record<string, any>;

  @Prop({ type: Object, required: false })
  newValues?: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  changedBy: Types.ObjectId;

  @Prop({ type: Date, default: Date.now, index: true })
  changedAt: Date;

  @Prop({ type: String, required: false })
  correlationId?: string;

  @Prop({ type: String, required: false })
  remarks?: string;
}

export const OrganizationHistoricalRecordSchema = SchemaFactory.createForClass(OrganizationHistoricalRecord);
OrganizationHistoricalRecordSchema.index({ organizationId: 1, changedAt: -1 });
OrganizationHistoricalRecordSchema.index({ changedBy: 1, changedAt: -1 });
OrganizationHistoricalRecordSchema.index({ recordType: 1 });

// ============================================================================
// TEAM HISTORICAL RECORD
// ============================================================================

export interface TeamHistoricalRecordDocument extends Document {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  teamName: string;
  recordType: 'created' | 'updated' | 'status_changed' | 'organization_changed' | 'roster_changed' | 'coaching_staff_changed' | 'season_record_added' | 'archived' | 'disbanded' | 'ai_metadata_updated' | 'branding_updated';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedBy: Types.ObjectId;
  changedAt: Date;
  correlationId?: string;
  remarks?: string;
}

@Schema({ collection: 'team_historical_records', timestamps: true })
export class TeamHistoricalRecord {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  teamId: Types.ObjectId;

  @Prop({ type: String, required: true })
  teamName: string;

  @Prop({ 
    type: String, 
    enum: ['created', 'updated', 'status_changed', 'organization_changed', 'roster_changed', 'coaching_staff_changed', 'season_record_added', 'archived', 'disbanded', 'ai_metadata_updated', 'branding_updated'],
    required: true 
  })
  recordType: string;

  @Prop({ type: Object, required: false })
  oldValues?: Record<string, any>;

  @Prop({ type: Object, required: false })
  newValues?: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  changedBy: Types.ObjectId;

  @Prop({ type: Date, default: Date.now, index: true })
  changedAt: Date;

  @Prop({ type: String, required: false })
  correlationId?: string;

  @Prop({ type: String, required: false })
  remarks?: string;
}

export const TeamHistoricalRecordSchema = SchemaFactory.createForClass(TeamHistoricalRecord);
TeamHistoricalRecordSchema.index({ teamId: 1, changedAt: -1 });
TeamHistoricalRecordSchema.index({ changedBy: 1, changedAt: -1 });
TeamHistoricalRecordSchema.index({ recordType: 1 });

// ============================================================================
// DTOs
// ============================================================================

export interface OrganizationRegistrationDTO {
  name: string;
  shortName: string;
  displayName: string;
  type: OrganizationType;
  registrationNumber: string;
  registrationDate: Date;
  registrationAuthority: string;
  licenseNumber?: string;
  licenseExpiry?: Date;
  address: OrganizationAddress;
  contact: OrganizationContact;
  branding?: Partial<OrganizationBranding>;
  aiMetadata?: Partial<AIMetadata>;
  parentOrganizationId?: string;
  governingBodyId?: string;
  governingBodyName?: string;
  affiliationDate?: Date;
  governanceTier?: number;
  tenantId: string;
  dataRegion?: string;
}

export interface OrganizationSearchParams {
  query?: string;
  type?: OrganizationType;
  status?: OrganizationStatus;
  tenantId: string;
  parentOrganizationId?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrganizationHierarchyNode {
  organization: OrganizationDocument;
  children: OrganizationHierarchyNode[];
  depth: number;
}

export interface OrganizationStatistics {
  totalOrganizations: number;
  byType: Record<OrganizationType, number>;
  byStatus: Record<OrganizationStatus, number>;
  totalTeams: number;
  totalFacilities: number;
  totalMembers?: number;
}

export interface TeamRegistrationDTO {
  name: string;
  shortName: string;
  displayName: string;
  organizationId: string;
  category: TeamCategory;
  gender: TeamGender;
  division?: string;
  level?: string;
  foundingDate?: Date;
  foundingSeason?: string;
  aiMetadata?: Partial<TeamAIMetadata>;
  branding?: Partial<TeamBranding>;
  jerseyRecognition?: TeamAIMetadata['jerseyRecognition'];
  tenantId: string;
}

export interface TeamSearchParams {
  query?: string;
  category?: TeamCategory;
  gender?: TeamGender;
  status?: TeamStatus;
  organizationId?: string;
  leagueId?: string;
  seasonId?: string;
  tenantId: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TeamWithOrganization {
  team: TeamDocument;
  organization: OrganizationDocument;
}

// ============================================================================
// ORGANIZATION TYPE SCHEMA
// ============================================================================

export interface OrganizationTypeDocument extends Document {
  _id: Types.ObjectId;
  typeId: string;
  typeName: string;
  description?: string;
  parentType?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'organization_types', timestamps: true })
export class OrganizationType {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  typeId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  typeName: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false, index: true })
  parentType?: string;

  @ApiProperty()
  @Prop({ type: String, required: true, default: 'active', index: true })
  status: string;
}

export const OrganizationTypeSchema = SchemaFactory.createForClass(OrganizationType);
OrganizationTypeSchema.index({ typeName: 1 }, { unique: true });
OrganizationTypeSchema.index({ parentType: 1 });
OrganizationTypeSchema.index({ status: 1 });

// ============================================================================
// LEAGUE MEMBERSHIP SCHEMA
// ============================================================================

export enum MembershipStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  EXPIRED = 'expired',
}

export interface LeagueMembershipDocument extends Document {
  _id: Types.ObjectId;
  membershipId: string;
  organizationId: Types.ObjectId;
  leagueId: Types.ObjectId;
  season: string;
  membershipStatus: MembershipStatus;
  joiningDate: Date;
  expiryDate?: Date;
  division?: string;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  terminatedAt?: Date;
  terminatedBy?: Types.ObjectId;
  terminationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'league_memberships', timestamps: true })
export class LeagueMembership {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  membershipId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'League', required: true, index: true })
  leagueId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  season: string;

  @ApiProperty({ enum: MembershipStatus })
  @Prop({ type: String, enum: MembershipStatus, required: true, default: MembershipStatus.PENDING, index: true })
  membershipStatus: MembershipStatus;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  joiningDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  expiryDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  division?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  approvedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  approvedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  terminatedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  terminatedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  terminationReason?: string;
}

export const LeagueMembershipSchema = SchemaFactory.createForClass(LeagueMembership);
LeagueMembershipSchema.index({ organizationId: 1, leagueId: 1, season: 1 }, { unique: true });
LeagueMembershipSchema.index({ organizationId: 1 });
LeagueMembershipSchema.index({ leagueId: 1 });
LeagueMembershipSchema.index({ season: 1 });
LeagueMembershipSchema.index({ membershipStatus: 1 });

// ============================================================================
// ORGANIZATION LICENSE SCHEMA
// ============================================================================

export enum LicenseType {
  OPERATING = 'operating',
  FACILITY = 'facility',
  COACHING = 'coaching',
  MEDICAL = 'medical',
  BROADCASTING = 'broadcasting',
  SPONSORSHIP = 'sponsorship',
  COMPETITION = 'competition',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  RENEWAL_PENDING = 'renewal_pending',
}

export interface OrganizationLicenseDocument extends Document {
  _id: Types.ObjectId;
  licenseId: string;
  organizationId: Types.ObjectId;
  licenseType: LicenseType;
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  verificationStatus: VerificationStatus;
  documents: string[];
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'organization_licenses', timestamps: true })
export class OrganizationLicense {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  licenseId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @ApiProperty({ enum: LicenseType })
  @Prop({ type: String, enum: LicenseType, required: true, index: true })
  licenseType: LicenseType;

  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  licenseNumber: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  issuingAuthority: string;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  issueDate: Date;

  @ApiProperty()
  @Prop({ type: Date, required: true, index: true })
  expiryDate: Date;

  @ApiProperty({ enum: VerificationStatus })
  @Prop({ type: String, enum: VerificationStatus, required: true, default: VerificationStatus.PENDING, index: true })
  verificationStatus: VerificationStatus;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  documents: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  verifiedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  verifiedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  rejectionReason?: string;
}

export const OrganizationLicenseSchema = SchemaFactory.createForClass(OrganizationLicense);
OrganizationLicenseSchema.index({ organizationId: 1 });
OrganizationLicenseSchema.index({ licenseType: 1 });
OrganizationLicenseSchema.index({ expiryDate: 1 });
OrganizationLicenseSchema.index({ verificationStatus: 1 });
OrganizationLicenseSchema.index({ licenseNumber: 1 }, { unique: true });

// ============================================================================
// FACILITY SCHEMA
// ============================================================================

export enum FacilityType {
  INDOOR_COURT = 'indoor_court',
  BEACH_COURT = 'beach_court',
  SITTING_VOLLEYBALL_COURT = 'sitting_volleyball_court',
  TRAINING_CENTER = 'training_center',
  GYMNASIUM = 'gymnasium',
  STADIUM = 'stadium',
  REHABILITATION_CENTER = 'rehabilitation_center',
  ADMINISTRATIVE = 'administrative',
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
  RENOVATION = 'renovation',
}

export interface FacilityAddress {
  country: string;
  stateProvince?: string;
  county?: string;
  city: string;
  postalCode: string;
  physicalAddress: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface FacilityDocument extends Document {
  _id: Types.ObjectId;
  facilityId: string;
  organizationId: Types.ObjectId;
  facilityName: string;
  facilityType: FacilityType;
  address: FacilityAddress;
  capacity: number;
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  courtType: string;
  lighting?: string;
  availabilityStatus: AvailabilityStatus;
  amenities?: string[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'organization_facilities', timestamps: true })
export class Facility {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  facilityId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  facilityName: string;

  @ApiProperty({ enum: FacilityType })
  @Prop({ type: String, enum: FacilityType, required: true, index: true })
  facilityType: FacilityType;

  @ApiProperty()
  @Prop({ type: Object, required: true })
  address: FacilityAddress;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 0 })
  capacity: number;

  @ApiProperty()
  @Prop({ type: String, enum: ['indoor', 'outdoor', 'both'], required: true })
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';

  @ApiProperty()
  @Prop({ type: String, required: true })
  courtType: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  lighting?: string;

  @ApiProperty({ enum: AvailabilityStatus })
  @Prop({ type: String, enum: AvailabilityStatus, required: true, default: AvailabilityStatus.AVAILABLE, index: true })
  availabilityStatus: AvailabilityStatus;

  @ApiProperty({ type: [String], required: false })
  @Prop({ type: [String], default: [] })
  amenities?: string[];

  @ApiProperty({ type: [String], required: false })
  @Prop({ type: [String], default: [] })
  images?: string[];
}

export const FacilitySchema = SchemaFactory.createForClass(Facility);
FacilitySchema.index({ organizationId: 1 });
FacilitySchema.index({ facilityType: 1 });
FacilitySchema.index({ availabilityStatus: 1 });
FacilitySchema.index({ facilityName: 'text' });

// ============================================================================
// ORGANIZATION HIERARCHY SCHEMA
// ============================================================================

export enum HierarchyRelationshipType {
  PARENT_CHILD = 'parent_child',
  AFFILIATE = 'affiliate',
  BRANCH = 'branch',
  FRANCHISE = 'franchise',
  PARTNERSHIP = 'partnership',
}

export enum HierarchyStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  REMOVED = 'removed',
  SUSPENDED = 'suspended',
}

export interface OrganizationHierarchyDocument extends Document {
  _id: Types.ObjectId;
  hierarchyId: string;
  parentOrganizationId: Types.ObjectId;
  childOrganizationId: Types.ObjectId;
  relationshipType: HierarchyRelationshipType;
  effectiveDate: Date;
  status: HierarchyStatus;
  removedAt?: Date;
  removedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'organization_hierarchy', timestamps: true })
export class OrganizationHierarchy {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  hierarchyId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  parentOrganizationId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  childOrganizationId: Types.ObjectId;

  @ApiProperty({ enum: HierarchyRelationshipType })
  @Prop({ type: String, enum: HierarchyRelationshipType, required: true, index: true })
  relationshipType: HierarchyRelationshipType;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  effectiveDate: Date;

  @ApiProperty({ enum: HierarchyStatus })
  @Prop({ type: String, enum: HierarchyStatus, required: true, default: HierarchyStatus.ACTIVE, index: true })
  status: HierarchyStatus;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  removedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  removedBy?: Types.ObjectId;
}

export const OrganizationHierarchySchema = SchemaFactory.createForClass(OrganizationHierarchy);
OrganizationHierarchySchema.index({ parentOrganizationId: 1, childOrganizationId: 1 }, { unique: true });
OrganizationHierarchySchema.index({ parentOrganizationId: 1 });
OrganizationHierarchySchema.index({ childOrganizationId: 1 });
OrganizationHierarchySchema.index({ relationshipType: 1 });
OrganizationHierarchySchema.index({ status: 1 });

// ============================================================================
// INVITATION SCHEMAS
// ============================================================================

export enum InvitationType {
  ORGANIZATION_ADMIN = 'organization_admin',
  ORGANIZATION_MEMBER = 'organization_member',
  TEAM_PLAYER = 'team_player',
  TEAM_COACH = 'team_coach',
  TEAM_STAFF = 'team_staff',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export interface BaseInvitationDocument extends Document {
  _id: Types.ObjectId;
  invitationId: string;
  email: string;
  role: string;
  invitationType: InvitationType;
  invitedBy: Types.ObjectId;
  invitedAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  status: InvitationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationInvitationDocument extends BaseInvitationDocument {
  organizationId: Types.ObjectId;
}

@Schema({ collection: 'organization_invitations', timestamps: true })
export class OrganizationInvitation {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  invitationId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  email: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  role: string;

  @ApiProperty({ enum: InvitationType })
  @Prop({ type: String, enum: InvitationType, required: true, index: true })
  invitationType: InvitationType;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedBy: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  invitedAt: Date;

  @ApiProperty()
  @Prop({ type: Date, required: true, index: true })
  expiresAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  acceptedAt?: Date;

  @ApiProperty({ enum: InvitationStatus })
  @Prop({ type: String, enum: InvitationStatus, required: true, default: InvitationStatus.PENDING, index: true })
  status: InvitationStatus;
}

export const OrganizationInvitationSchema = SchemaFactory.createForClass(OrganizationInvitation);
OrganizationInvitationSchema.index({ invitationId: 1 }, { unique: true });
OrganizationInvitationSchema.index({ email: 1 });
OrganizationInvitationSchema.index({ invitationType: 1 });
OrganizationInvitationSchema.index({ status: 1 });
OrganizationInvitationSchema.index({ expiresAt: 1 });
OrganizationInvitationSchema.index({ organizationId: 1, status: 1 });

export interface TeamInvitationDocument extends BaseInvitationDocument {
  teamId: Types.ObjectId;
  organizationId: Types.ObjectId;
}

@Schema({ collection: 'team_invitations', timestamps: true })
export class TeamInvitation {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  invitationId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  teamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  email: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  role: string;

  @ApiProperty({ enum: InvitationType })
  @Prop({ type: String, enum: InvitationType, required: true, index: true })
  invitationType: InvitationType;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedBy: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  invitedAt: Date;

  @ApiProperty()
  @Prop({ type: Date, required: true, index: true })
  expiresAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  acceptedAt?: Date;

  @ApiProperty({ enum: InvitationStatus })
  @Prop({ type: String, enum: InvitationStatus, required: true, default: InvitationStatus.PENDING, index: true })
  status: InvitationStatus;
}

export const TeamInvitationSchema = SchemaFactory.createForClass(TeamInvitation);
TeamInvitationSchema.index({ invitationId: 1 }, { unique: true });
TeamInvitationSchema.index({ email: 1 });
TeamInvitationSchema.index({ invitationType: 1 });
TeamInvitationSchema.index({ status: 1 });
TeamInvitationSchema.index({ expiresAt: 1 });
TeamInvitationSchema.index({ teamId: 1, status: 1 });
TeamInvitationSchema.index({ organizationId: 1, status: 1 });

// ============================================================================
// BRANDING SCHEMA
// ============================================================================

export enum EntityType {
  ORGANIZATION = 'organization',
  TEAM = 'team',
}

export interface TeamBrandingDocument extends Document {
  _id: Types.ObjectId;
  entityId: Types.ObjectId;
  entityType: EntityType;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  logoLightUrl?: string;
  faviconUrl?: string;
  bannerUrl?: string;
  brandingGuidelinesUrl?: string;
  mascot?: string;
  nickname?: string;
  motto?: string;
  kitDesign?: {
    home: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    away: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    alternate?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    goalkeeper?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'team_branding', timestamps: true })
export class TeamBranding {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, required: true, index: true })
  entityId: Types.ObjectId;

  @ApiProperty({ enum: EntityType })
  @Prop({ type: String, enum: EntityType, required: true, index: true })
  entityType: EntityType;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  primaryColor?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  secondaryColor?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  accentColor?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  logoDarkUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  logoLightUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  faviconUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  bannerUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  brandingGuidelinesUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  mascot?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  nickname?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  motto?: string;

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object, required: false })
  kitDesign?: {
    home: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    away: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    alternate?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    goalkeeper?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
  };
}

export const TeamBrandingSchema = SchemaFactory.createForClass(TeamBranding);
TeamBrandingSchema.index({ entityId: 1, entityType: 1 }, { unique: true });
TeamBrandingSchema.index({ entityType: 1 });
TeamBrandingSchema.index({ logoUrl: 1 });

// ============================================================================
// TEAM SEASON SCHEMA
// ============================================================================

export interface TeamSeasonDocument extends Document {
  _id: Types.ObjectId;
  seasonId: Types.ObjectId;
  seasonName: string;
  leagueId?: Types.ObjectId;
  leagueName?: string;
  division?: string;
  finalStanding?: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
  setsWon: number;
  setsLost: number;
  rosterSnapshot: Types.ObjectId[];
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'team_seasons', timestamps: true })
export class TeamSeason {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Season', required: true, index: true })
  seasonId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  seasonName: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'League', required: false, index: true })
  leagueId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  leagueName?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  division?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number, required: false })
  finalStanding?: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  matchesPlayed: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  wins: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  losses: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  draws: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  pointsFor: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  pointsAgainst: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  setsWon: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  setsLost: number;

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], default: [] })
  rosterSnapshot: Types.ObjectId[];

  @ApiProperty()
  @Prop({ type: Boolean, required: true, default: false })
  isArchived: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  archivedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  archivedBy?: Types.ObjectId;
}

export const TeamSeasonSchema = SchemaFactory.createForClass(TeamSeason);
TeamSeasonSchema.index({ seasonId: 1 });
TeamSeasonSchema.index({ leagueId: 1 });

// ============================================================================
// ORGANIZATION DOCUMENT SCHEMA
// ============================================================================

export interface OrganizationDocumentDoc extends Document {
  _id: Types.ObjectId;
  documentId: string;
  organizationId: Types.ObjectId;
  documentType: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  issuedAt: Date;
  expiresAt?: Date;
  issuedBy: string;
  isVerified: boolean;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'organization_documents', timestamps: true })
export class OrganizationDocument {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  documentId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  documentType: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  fileUrl: string;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  fileSize: number;

  @ApiProperty()
  @Prop({ type: String, required: true })
  mimeType: string;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  issuedAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  expiresAt?: Date;

  @ApiProperty()
  @Prop({ type: String, required: true })
  issuedBy: string;

  @ApiProperty()
  @Prop({ type: Boolean, required: true, default: false })
  isVerified: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  verifiedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date, required: false })
  verifiedAt?: Date;
}

export const OrganizationDocumentSchema = SchemaFactory.createForClass(OrganizationDocument);
OrganizationDocumentSchema.index({ organizationId: 1 });
OrganizationDocumentSchema.index({ documentType: 1 });
OrganizationDocumentSchema.index({ isVerified: 1 });

// ============================================================================
// ORGANIZATION ADMINISTRATOR SCHEMA
// ============================================================================

export interface OrganizationAdministratorDocument extends Document {
  _id: Types.ObjectId;
  adminId: string;
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: string;
  assignedAt: Date;
  assignedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'organization_administrators', timestamps: true })
export class OrganizationAdministrator {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  adminId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  role: string;

  @ApiProperty()
  @Prop({ type: Date, required: true, default: Date.now })
  assignedAt: Date;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assignedBy: Types.ObjectId;
}

export const OrganizationAdministratorSchema = SchemaFactory.createForClass(OrganizationAdministrator);
OrganizationAdministratorSchema.index({ organizationId: 1 });
OrganizationAdministratorSchema.index({ userId: 1 });
OrganizationAdministratorSchema.index({ role: 1 });

// ============================================================================
// ORGANIZATION AUDIT LOG SCHEMA
// ============================================================================

export interface OrganizationAuditLogDocument extends Document {
  _id: Types.ObjectId;
  auditId: string;
  userId?: Types.ObjectId;
  userRole?: string;
  action: string;
  entityType: string;
  entityId: Types.ObjectId;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  correlationId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  timestamp: Date;
  ipAddress?: string;
  device?: string;
  userAgent?: string;
  result: string;
  errorMessage?: string;
}

@Schema({ collection: 'organization_audit_logs', timestamps: false })
export class OrganizationAuditLog {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  auditId: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  userId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false, index: true })
  userRole?: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  action: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  entityType: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, required: true, index: true })
  entityId: Types.ObjectId;

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object, required: false })
  oldValues?: Record<string, any>;

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object, required: false })
  newValues?: Record<string, any>;

  @ApiProperty({ type: [String], required: false })
  @Prop({ type: [String], required: false })
  changedFields?: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false, index: true })
  correlationId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  requestId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  endpoint?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  method?: string;

  @ApiProperty()
  @Prop({ type: Date, required: true, default: Date.now, index: true })
  timestamp: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  ipAddress?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  device?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  userAgent?: string;

  @ApiProperty()
  @Prop({ type: String, required: true, default: 'success' })
  result: string;

  @ApiProperty({ required: false })
  @Prop({ type: String, required: false })
  errorMessage?: string;
}

export const OrganizationAuditLogSchema = SchemaFactory.createForClass(OrganizationAuditLog);
OrganizationAuditLogSchema.index({ userId: 1 });
OrganizationAuditLogSchema.index({ action: 1 });
OrganizationAuditLogSchema.index({ entityType: 1, entityId: 1 });
OrganizationAuditLogSchema.index({ timestamp: -1 });
OrganizationAuditLogSchema.index({ correlationId: 1 });
OrganizationAuditLogSchema.index({ userId: 1, timestamp: -1 });

// ============================================================================
// ADD MISSING INDEXES TO EXISTING SCHEMAS
// ============================================================================

// Add missing indexes to OrganizationSchema
OrganizationSchema.index({ organizationCode: 1 }, { unique: true, sparse: true });
OrganizationSchema.index({ 'contact.email': 1 });
OrganizationSchema.index({ 'address.country': 1 });

// Add missing indexes to TeamSchema
TeamSchema.index({ league: 1 });
TeamSchema.index({ season: 1 });

// Export all schema factories for registration
export const MODULE_SCHEMAS = [
  { name: Organization.name, schema: OrganizationSchema },
  { name: Team.name, schema: TeamSchema },
  { name: OrganizationHistoricalRecord.name, schema: OrganizationHistoricalRecordSchema },
  { name: TeamHistoricalRecord.name, schema: TeamHistoricalRecordSchema },
  { name: OrganizationType.name, schema: OrganizationTypeSchema },
  { name: LeagueMembership.name, schema: LeagueMembershipSchema },
  { name: OrganizationLicense.name, schema: OrganizationLicenseSchema },
  { name: Facility.name, schema: FacilitySchema },
  { name: OrganizationHierarchy.name, schema: OrganizationHierarchySchema },
  { name: OrganizationInvitation.name, schema: OrganizationInvitationSchema },
  { name: TeamInvitation.name, schema: TeamInvitationSchema },
  { name: TeamBranding.name, schema: TeamBrandingSchema },
  { name: TeamSeason.name, schema: TeamSeasonSchema },
  { name: OrganizationDocument.name, schema: OrganizationDocumentSchema },
  { name: OrganizationAdministrator.name, schema: OrganizationAdministratorSchema },
  { name: OrganizationAuditLog.name, schema: OrganizationAuditLogSchema },
];