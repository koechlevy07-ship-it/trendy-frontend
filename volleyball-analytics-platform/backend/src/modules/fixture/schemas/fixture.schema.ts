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
  SWISS = 'swiss',
  GROUP_STAGE = 'group_stage',
  HYBRID = 'hybrid',
}

@Schema({ _id: false })
export class FixtureVenue {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true })
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
  @Prop({ type: Boolean, default: true })
  avoidBackToBack: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean, default: true })
  balanceHomeAway: boolean;
}

@Schema({ _id: false })
export class FixtureAuditInfo {
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

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'CompetitionPhase' })
  phaseId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'CompetitionGroup' })
  groupId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
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

  @ApiProperty({ type: FixtureVenue })
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

  @ApiProperty({ required: false })
  @Prop({ type: String })
  timeZone?: string;

  @ApiProperty({ enum: FixtureStatus })
  @Prop({ type: String, enum: FixtureStatus, required: true, default: FixtureStatus.DRAFT, index: true })
  status: FixtureStatus;

  @ApiProperty({ enum: FixtureGenerationMethod })
  @Prop({ type: String, enum: FixtureGenerationMethod, required: true, default: FixtureGenerationMethod.MANUAL })
  generationMethod: FixtureGenerationMethod;

  @ApiProperty({ type: FixtureSchedulingConstraints })
  @Prop({ type: FixtureSchedulingConstraints, required: true })
  schedulingConstraints: FixtureSchedulingConstraints;

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'Official', default: [] })
  assignedOfficials: Types.ObjectId[];

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  matchId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  broadcastInfo?: string;

  @ApiProperty({ type: FixtureSchedulingConstraints })
  @Prop({ type: FixtureSchedulingConstraints, required: true })
  schedulingConstraints: FixtureSchedulingConstraints;

  @ApiProperty({ type: FixtureAuditInfo })
  @Prop({ type: FixtureAuditInfo, required: true })
  audit: FixtureAuditInfo;

  @ApiProperty({ type: FixtureArchive })
  @Prop({ type: FixtureArchive, required: true })
  archive: FixtureArchive;

  @ApiProperty({ type: Object, default: {} })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const FixtureSchema = SchemaFactory.createForClass(Fixture);

// Indexes
FixtureSchema.index({ fixtureId: 1 }, { unique: true });
FixtureSchema.index({ competitionId: 1, status: 1 });
FixtureSchema.index({ seasonId: 1, status: 1 });
FixtureSchema.index({ 'venue.facilityId': 1, scheduledDate: 1 });
FixtureSchema.index({ homeTeamId: 1, status: 1 });
FixtureSchema.index({ awayTeamId: 1, status: 1 });
FixtureSchema.index({ scheduledDate: 1, status: 1 });
FixtureSchema.index({ fixtureId: 1 }, { unique: true });
FixtureSchema.index({ status: 1, scheduledDate: 1 });
FixtureSchema.index({ 'venue.facilityId': 1, scheduledDate: 1 });
FixtureSchema.index({ round: 1, status: 1 });

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
  return [FixtureStatus.SCHEDULED, FixtureStatus.CONFIRMED].includes(this.status) && this.scheduledDate > new Date();
});

// Virtual for isPast
FixtureSchema.virtual('isPast').get(function() {
  return this.status === FixtureStatus.COMPLETED && this.actualEndTime && this.actualEndTime < new Date();
});