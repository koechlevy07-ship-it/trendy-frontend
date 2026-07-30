/**
 * Competition Fixtures Schema - Chapter 12 Part 2
 * 
 * Represents scheduled matches within a competition.
 * Supports fixture generation, scheduling constraints, and venue management.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type FixtureDocument = Fixture & Document;

export enum FixtureStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  POSTPONED = 'postponed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

export enum FixtureGenerationMethod {
  MANUAL = 'manual',
  ROUND_ROBIN = 'round_robin',
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  GROUP_STAGE = 'group_stage',
  SWISS = 'swiss',
  HYBRID = 'hybrid',
}

@Schema({ _id: false })
export class FixtureVenue {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Facility', required: true })
  facilityId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Court' })
  courtId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  preferredStartTime?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  backupVenueId?: string;
}

@Schema({ _id: false })
export class FixtureSchedulingConstraints {
  @ApiProperty({ required: false })
  @Prop({ type: [String] })
  preferredDays?: string[];

  @ApiProperty({ required: false })
  @Prop({ type: [String] })
  excludedDates?: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  timeSlotConstraints?: {
    earliestStart: string;
    latestEnd: string;
    minRestHours: number;
    maxConsecutiveDays: number;
  };

  @ApiProperty({ required: false })
  @Prop({ type: Number, default: 24 })
  minRestHours: number;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  avoidBackToBack: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  balanceHomeAway: boolean;
}

@Schema({ _id: false })
export class FixtureBroadcast {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  streamUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: [String] })
  broadcastChannels?: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  streamingPlatform?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  commentaryLanguage?: string;
}

@Schema({ _id: false })
export class FixtureAuditInfo {
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
export class FixtureArchive {
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
  collection: 'fixtures',
  timestamps: true,
  versionKey: 'version',
})
export class Fixture {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  fixtureId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Competition', required: true, index: true })
  competitionId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Season', required: true, index: true })
  seasonId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'CompetitionPhase' })
  phaseId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'CompetitionGroup' })
  groupId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  round: string;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 1 })
  roundNumber: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  matchNumber?: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  homeTeamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  awayTeamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: FixtureVenue, required: true })
  venue: FixtureVenue;

  @ApiProperty()
  @Prop({ type: Date, required: true, index: true })
  scheduledDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  actualStartTime?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  actualEndTime?: Date;

  @ApiProperty({ enum: FixtureStatus })
  @Prop({ type: String, enum: FixtureStatus, required: true, default: FixtureStatus.DRAFT, index: true })
  status: FixtureStatus;

  @ApiProperty({ enum: FixtureGenerationMethod })
  @Prop({ type: String, enum: FixtureGenerationMethod, required: true, default: FixtureGenerationMethod.MANUAL })
  generationMethod: FixtureGenerationMethod;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Match' })
  matchId?: Types.ObjectId;

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'Official', default: [] })
  assignedOfficials: Types.ObjectId[];

  @ApiProperty({ type: FixtureSchedulingConstraints, required: true })
  @Prop({ type: FixtureSchedulingConstraints, required: true })
  schedulingConstraints: FixtureSchedulingConstraints;

  @ApiProperty({ type: FixtureBroadcast })
  @Prop({ type: FixtureBroadcast })
  broadcast?: FixtureBroadcast;

  @ApiProperty({ type: FixtureAuditInfo, required: true })
  @Prop({ type: FixtureAuditInfo, required: true })
  audit: FixtureAuditInfo;

  @ApiProperty()
  @Prop({ type: FixtureArchive, required: true })
  archive: FixtureArchive;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const FixtureSchema = SchemaFactory.createForClass(Fixture);

// Indexes per 12.22
FixtureSchema.index({ competitionId: 1, phaseId: 1, roundNumber: 1 });
FixtureSchema.index({ competitionId: 1, scheduledDate: 1 });
FixtureSchema.index({ homeTeamId: 1, scheduledDate: 1 });
FixtureSchema.index({ awayTeamId: 1, scheduledDate: 1 });
FixtureSchema.index({ scheduledVenue: 1, scheduledDate: 1 });
FixtureSchema.index({ fixtureId: 1 }, { unique: true });
FixtureSchema.index({ status: 1, scheduledDate: 1 });

// Virtual for isLive
FixtureSchema.virtual('isLive').get(function() {
  return this.status === FixtureStatus.IN_PROGRESS;
});

// Virtual for isCompleted
FixtureSchema.virtual('isCompleted').get(function() {
  return this.status === FixtureStatus.COMPLETED;
});

// Virtual for isUpcoming
FixtureSchema.virtual('isUpcoming').get(function() {
  return [FixtureStatus.SCHEDULED, FixtureStatus.CONFIRMED].includes(this.status);
});

// Validation: home and away teams must be different
FixtureSchema.pre('save', function(next) {
  if (this.homeTeamId && this.awayTeamId && this.homeTeamId.toString() === this.awayTeamId.toString()) {
    return next(new Error('Home and away teams must be different'));
  }
  next();
});

// Validation: fixture cannot be confirmed if teams not assigned
FixtureSchema.pre('save', function(next) {
  if (this.status === 'confirmed' && (!this.homeTeamId || !this.awayTeamId)) {
    return next(new Error('Cannot confirm fixture without both teams assigned'));
  }
  next();
});

// Validation: scheduled venue must be assigned for confirmed fixtures
FixtureSchema.pre('save', function(next) {
  if (this.status === 'confirmed' && !this.venue.facilityId) {
    return next(new Error('Confirmed fixtures must have a venue assigned'));
  }
  next();
});