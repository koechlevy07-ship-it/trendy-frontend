/**
 * Competition Domain Model - Chapter 12 Part 1
 * 
 * Core domain model for competitions in the volleyball platform.
 * Supports leagues, tournaments, championships, and friendly competitions.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

// ============================================================================
// ENUMS
// ============================================================================

export enum CompetitionType {
  LEAGUE = 'league',
  TOURNAMENT = 'tournament',
  CHAMPIONSHIP = 'championship',
  CUP = 'cup',
  FRIENDLY = 'friendly',
  PLAYOFF = 'playoff',
  QUALIFIER = 'qualifier',
  EXHIBITION = 'exhibition',
}

export enum CompetitionStatus {
  DRAFT = 'draft',
  REGISTRATION_OPEN = 'registration_open',
  REGISTRATION_CLOSED = 'registration_closed',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

export enum CompetitionFormat {
  ROUND_ROBIN = 'round_robin',
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  GROUP_STAGE = 'group_stage',
  SWISS = 'swiss',
  LADDER = 'ladder',
  HYBRID = 'hybrid',
}

export enum ScoringSystem {
  BEST_OF_3 = 'best_of_3',
  BEST_OF_5 = 'best_of_5',
  BEST_OF_7 = 'best_of_7',
  POINTS_BASED = 'points_based',
  SETS_BASED = 'sets_based',
}

// ============================================================================
// SUB-DOCUMENTS
// ============================================================================

@Schema({ _id: false })
export class CompetitionRules {
  @ApiProperty({ enum: ScoringSystem })
  @Prop({ type: String, enum: ScoringSystem, required: true })
  scoringSystem: ScoringSystem;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 25 })
  pointsPerSet: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 15 })
  decidingSetPoints: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 2 })
  minPointsDifference: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 3 })
  maxSets: number;

  @ApiProperty()
  @Prop({ type: Boolean, default: true })
  liberoAllowed: boolean;

  @ApiProperty()
  @Prop({ type: Number, default: 2 })
  technicalTimeouts: number;

  @ApiProperty()
  @Prop({ type: Number, default: 2 })
  teamTimeoutsPerSet: number;

  @ApiProperty()
  @Prop({ type: Number, default: 30 })
  timeoutDuration: number;

  @ApiProperty()
  @Prop({ type: Number, default: 60 })
  intervalDuration: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  customRules?: string;
}

@Schema({ _id: false })
export class CompetitionSchedule {
  @ApiProperty()
  @Prop({ type: Date, required: true })
  startDate: Date;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  endDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  registrationOpenDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  registrationCloseDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  schedulePublishedDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: [String] })
  matchDays?: string[];

  @ApiProperty({ required: false })
  @Prop({ type: [String] })
  excludedDates?: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  timeSlotConstraints?: {
    earliestStart: string;
    latestEnd: string;
    minRestHours: number;
  };
}

@Schema({ _id: false })
export class CompetitionRanking {
  @ApiProperty()
  @Prop({ type: Number, default: 1 })
  position: number;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  matchesPlayed: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  wins: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  losses: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  draws: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  setsWon: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  setsLost: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  pointsFor: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  pointsAgainst: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  points: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  setRatio: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  pointsRatio: number;
}

@Schema({ _id: false })
export class CompetitionPrize {
  @ApiProperty()
  @Prop({ type: Number, required: true })
  position: number;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  value?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  sponsor?: string;
}

@Schema({ _id: false })
export class CompetitionMetadata {
  @ApiProperty()
  @Prop({ type: String })
  logoUrl?: string;

  @ApiProperty()
  @Prop({ type: String })
  bannerUrl?: string;

  @ApiProperty()
  @Prop({ type: String })
  officialWebsite?: string;

  @ApiProperty()
  @Prop({ type: String })
  streamingUrl?: string;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  sponsors: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  broadcastPartners: string[];

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  customFields: Record<string, any>;
}

@Schema({ _id: false })
export class CompetitionAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  version: number;

  @ApiProperty()
  @Prop({ type: String })
  auditReference?: string;
}

@Schema({ _id: false })
export class CompetitionArchive {
  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
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

// ============================================================================
// MAIN COMPETITION SCHEMA
// ============================================================================

@Schema({ 
  collection: 'competitions',
  timestamps: true,
  versionKey: 'version',
})
export class Competition {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  competitionId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true, maxlength: 10, index: true })
  shortName: string;

  @ApiProperty()
  @Prop({ type: String })
  description: string;

  @ApiProperty({ enum: CompetitionType })
  @Prop({ type: String, enum: CompetitionType, required: true, index: true })
  type: CompetitionType;

  @ApiProperty({ enum: CompetitionFormat })
  @Prop({ type: String, enum: CompetitionFormat, required: true })
  format: CompetitionFormat;

  @ApiProperty({ enum: CompetitionStatus })
  @Prop({ type: String, enum: CompetitionStatus, required: true, default: CompetitionStatus.DRAFT, index: true })
  status: CompetitionStatus;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Season', required: true, index: true })
  seasonId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizerId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: CompetitionRules, required: true })
  rules: CompetitionRules;

  @ApiProperty()
  @Prop({ type: CompetitionSchedule, required: true })
  schedule: CompetitionSchedule;

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'Team', default: [] })
  participantIds: Types.ObjectId[];

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 12 })
  maxParticipants: number;

  @ApiProperty({ type: [CompetitionRanking], default: [] })
  @Prop({ type: [CompetitionRanking], default: [] })
  ranking: CompetitionRanking[];

  @ApiProperty({ type: [CompetitionPrize], default: [] })
  @Prop({ type: [CompetitionPrize], default: [] })
  prizes: CompetitionPrize[];

  @ApiProperty()
  @Prop({ type: CompetitionMetadata })
  metadata: CompetitionMetadata;

  @ApiProperty()
  @Prop({ type: CompetitionAuditInfo })
  audit: CompetitionAuditInfo;

  @ApiProperty()
  @Prop({ type: CompetitionArchive })
  archive: CompetitionArchive;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const CompetitionSchema = SchemaFactory.createForClass(Competition);

// Indexes
CompetitionSchema.index({ seasonId: 1, status: 1 });
CompetitionSchema.index({ organizerId: 1, status: 1 });
CompetitionSchema.index({ participantIds: 1 });
CompetitionSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
CompetitionSchema.index({ name: 'text', shortName: 'text', description: 'text' });
CompetitionSchema.index({ competitionId: 1 }, { unique: true });
CompetitionSchema.index({ shortName: 1 });

// Virtual for isActive
CompetitionSchema.virtual('isActive').get(function() {
  return [CompetitionStatus.SCHEDULED, CompetitionStatus.IN_PROGRESS].includes(this.status);
});

// Virtual for isCompleted
CompetitionSchema.virtual('isCompleted').get(function() {
  return [CompetitionStatus.COMPLETED, CompetitionStatus.ARCHIVED].includes(this.status);
});

// Virtual for participantCount
CompetitionSchema.virtual('participantCount').get(function() {
  return this.participantIds?.length || 0;
});

// Virtual for registrationOpen
CompetitionSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  return this.status === CompetitionStatus.REGISTRATION_OPEN &&
    this.schedule.registrationOpenDate &&
    this.schedule.registrationOpenDate <= now &&
    this.schedule.registrationCloseDate &&
    this.schedule.registrationCloseDate >= now;
});

// Virtual for currentPhase
CompetitionSchema.virtual('currentPhase').get(function() {
  if (!this.phases || this.phases.length === 0) return null;
  const now = new Date();
  return this.phases.find(p => p.startDate <= now && p.endDate >= now) || null;
});