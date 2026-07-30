/**
 * Competition Phase Schema - Chapter 12 Part 1
 * 
 * Represents phases/stages within a competition (qualification, group stage, knockout, etc.)
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CompetitionPhaseDocument = CompetitionPhase & Document;

export enum CompetitionPhaseType {
  QUALIFICATION = 'qualification',
  PRELIMINARY = 'preliminary',
  GROUP_STAGE = 'group_stage',
  ROUND_OF_16 = 'round_of_16',
  QUARTER_FINAL = 'quarter_final',
  SEMI_FINAL = 'semi_final',
  THIRD_PLACE = 'third_place',
  FINAL = 'final',
  PLAYOFF = 'playoff',
  CONSOLATION = 'consolation',
}

export enum CompetitionPhaseStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ _id: false })
export class PhaseRules {
  @ApiProperty()
  @Prop({ type: Number, default: 1 })
  matchesPerPairing: number;

  @ApiProperty()
  @Prop({ type: Boolean, default: false })
  homeAndAway: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  tiebreakRules?: string;
}

@Schema({ _id: false })
export class PhaseSchedule {
  @ApiProperty()
  @Prop({ type: Date, required: true })
  startDate: Date;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  endDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: [String] })
  matchDays?: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  timeSlotConstraints?: {
    earliestStart: string;
    latestEnd: string;
    minRestHours: number;
  };
}

@Schema({ _id: false })
export class PhaseQualification {
  @ApiProperty()
  @Prop({ type: Number, required: true })
  teamsAdvancing: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  qualificationMethod?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'CompetitionPhase' })
  nextPhaseId?: Types.ObjectId;
}

@Schema({ _id: false })
export class PhaseAuditInfo {
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

@Schema({ 
  collection: 'competition_phases',
  timestamps: true,
  versionKey: 'version',
})
export class CompetitionPhase {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  phaseId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Competition', required: true, index: true })
  competitionId: Types.ObjectId;

  @ApiProperty({ enum: CompetitionPhaseType })
  @Prop({ type: String, enum: CompetitionPhaseType, required: true, index: true })
  type: CompetitionPhaseType;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 1 })
  order: number;

  @ApiProperty({ enum: CompetitionPhaseStatus })
  @Prop({ type: String, enum: CompetitionPhaseStatus, required: true, default: CompetitionPhaseStatus.PENDING, index: true })
  status: CompetitionPhaseStatus;

  @ApiProperty()
  @Prop({ type: PhaseRules, required: true })
  rules: PhaseRules;

  @ApiProperty()
  @Prop({ type: PhaseSchedule, required: true })
  schedule: PhaseSchedule;

  @ApiProperty()
  @Prop({ type: PhaseQualification, required: true })
  qualification: PhaseQualification;

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'Team', default: [] })
  participantIds: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'Match', default: [] })
  matchIds: Types.ObjectId[];

  @ApiProperty()
  @Prop({ type: PhaseAuditInfo })
  audit: PhaseAuditInfo;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const CompetitionPhaseSchema = SchemaFactory.createForClass(CompetitionPhase);

// Indexes
CompetitionPhaseSchema.index({ competitionId: 1, order: 1 });
CompetitionPhaseSchema.index({ competitionId: 1, status: 1 });
CompetitionPhaseSchema.index({ phaseId: 1 }, { unique: true });

// Virtual for isActive
CompetitionPhaseSchema.virtual('isActive').get(function() {
  return this.status === 'in_progress';
});

// Virtual for isCompleted
CompetitionPhaseSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});