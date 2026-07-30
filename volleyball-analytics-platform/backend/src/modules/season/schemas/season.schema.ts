/**
 * Season Schema - Chapter 12 Part 2
 * 
 * Represents a competition season (e.g., 2026 Season, 2027 Season)
 * Historical seasons remain immutable.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SeasonDocument = Season & Document;

export enum SeasonStatus {
  UPCOMING = 'upcoming',
  REGISTRATION_OPEN = 'registration_open',
  REGISTRATION_CLOSED = 'registration_closed',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Schema({ _id: false })
export class SeasonRules {
  @ApiProperty()
  @Prop({ type: Number, default: 12 })
  minTeamsPerCompetition: number;

  @ApiProperty()
  @Prop({ type: Number, default: 24 })
  maxTeamsPerCompetition: number;

  @ApiProperty()
  @Prop({ type: Boolean, default: true })
  allowTransfers: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  transferWindowStart?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  transferWindowEnd?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  customRules?: string;
}

@Schema({ _id: false })
export class SeasonSchedule {
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
  fixturesPublishedDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  midSeasonBreakStart?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  midSeasonBreakEnd?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  playoffsStartDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  finalsStartDate?: Date;
}

@Schema({ _id: false })
export class SeasonStatistics {
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  totalCompetitions: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  totalMatches: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  totalTeams: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  totalPlayers: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  totalGoals: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  averageAttendance: number;
}

@Schema({ _id: false })
export class SeasonMetadata {
  @ApiProperty()
  @Prop({ type: String })
  logoUrl?: string;

  @ApiProperty()
  @Prop({ type: String })
  bannerUrl?: string;

  @ApiProperty()
  @Prop({ type: String })
  tagline?: string;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  sponsors: string[];

  @ApiProperty()
  @Prop({ type: String })
  officialWebsite?: string;

  @ApiProperty()
  @Prop({ type: String })
  streamingPlatform?: string;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  broadcastPartners: string[];

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  customFields: Record<string, any>;
}

@Schema({ _id: false })
export class SeasonAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  version: number;
}

@Schema({ _id: false })
export class SeasonArchive {
  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false, index: true })
  isArchived: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  archivedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  archivedBy?: Types.ObjectId;
}

@Schema({ 
  collection: 'seasons',
  timestamps: true,
  versionKey: 'version',
})
export class Season {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  seasonId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  code: string;

  @ApiProperty()
  @Prop({ type: Number, required: true, index: true })
  year: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  displayName?: string;

  @ApiProperty()
  @Prop({ type: String })
  description: string;

  @ApiProperty({ enum: SeasonStatus })
  @Prop({ type: String, enum: SeasonStatus, required: true, default: SeasonStatus.UPCOMING, index: true })
  status: SeasonStatus;

  @ApiProperty()
  @Prop({ type: SeasonRules, required: true })
  rules: SeasonRules;

  @ApiProperty()
  @Prop({ type: SeasonSchedule, required: true })
  schedule: SeasonSchedule;

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'Competition', default: [], index: true })
  competitionIds: Types.ObjectId[];

  @ApiProperty()
  @Prop({ type: SeasonStatistics })
  statistics: SeasonStatistics;

  @ApiProperty()
  @Prop({ type: SeasonMetadata })
  metadata: SeasonMetadata;

  @ApiProperty()
  @Prop({ type: SeasonAuditInfo })
  audit: SeasonAuditInfo;

  @ApiProperty()
  @Prop({ type: SeasonArchive })
  archive: SeasonArchive;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const SeasonSchema = SchemaFactory.createForClass(Season);

// Indexes per 12.22
SeasonSchema.index({ year: 1 }, { unique: true });
SeasonSchema.index({ code: 1 }, { unique: true });
SeasonSchema.index({ status: 1, year: -1 });
SeasonSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
SeasonSchema.index({ seasonId: 1 }, { unique: true });
SeasonSchema.index({ code: 1 }, { unique: true });

// Virtual for isActive
SeasonSchema.virtual('isActive').get(function() {
  return this.status === SeasonStatus.ACTIVE || this.status === SeasonStatus.IN_PROGRESS;
});

// Virtual for isCompleted
SeasonSchema.virtual('isCompleted').get(function() {
  return [SeasonStatus.COMPLETED, SeasonStatus.ARCHIVED].includes(this.status);
});

// Virtual for isUpcoming
SeasonSchema.virtual('isUpcoming').get(function() {
  return [SeasonStatus.UPCOMING, SeasonStatus.REGISTRATION_OPEN, SeasonStatus.REGISTRATION_CLOSED].includes(this.status);
});

// Virtual for duration
SeasonSchema.virtual('durationDays').get(function() {
  if (this.schedule?.startDate && this.schedule?.endDate) {
    return Math.ceil((this.schedule.endDate.getTime() - this.schedule.startDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for competitionCount
SeasonSchema.virtual('competitionCount').get(function() {
  return this.competitionIds?.length || 0;
});

// Immutability: Historical seasons cannot be modified after archival
SeasonSchema.pre('save', function(next) {
  if (this.archive?.isArchived && !this.isNew) {
    return next(new Error('Archived seasons cannot be modified'));
  }
  next();
});

SeasonSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set['archive.isArchived'] === true) {
    // Allow archival
    return next();
  }
  // Check if trying to modify an archived season
  this.model.findOne(this.getQuery()).then(doc => {
    if (doc && doc.archive?.isArchived) {
      return next(new Error('Archived seasons cannot be modified'));
    }
    next();
  });
});