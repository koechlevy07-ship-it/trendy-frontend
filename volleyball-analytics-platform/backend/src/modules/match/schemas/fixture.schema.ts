/**
 * Fixture Schema - Chapter 12 Part 2
 * 
 * Represents a scheduled match fixture within a competition stage.
 * Fixture generation supports both automatic and manual scheduling.
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
}

export enum FixtureGenerationMethod {
  MANUAL = 'manual',
  ROUND_ROBIN = 'round_robin',
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  SWISS = 'swiss',
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

  @ApiProperty({ required: false })
  @Prop({ type: String })
  auditReference?: string;
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

  @ApiProperty({ required: false })
  @Prop({ type: String })
  archiveReason?: string;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  snapshot?: Record<string, any>;
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

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'CompetitionStage', required: true, index: true })
  stageId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'CompetitionGroup' })
  groupId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true, index: true })
  round: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  matchNumber: number;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  homeTeamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  awayTeamId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Facility' })
  scheduledVenue?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Court' })
  scheduledCourt?: Types.ObjectId;

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

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  schedulingConstraints: Record<string, any>;

  @ApiProperty()
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
FixtureSchema.index({ competitionId: 1, stageId: 1, round: 1 });
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