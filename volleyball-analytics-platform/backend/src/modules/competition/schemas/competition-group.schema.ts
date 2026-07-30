/**
 * Competition Group Schema - Chapter 12 Part 1
 * 
 * Represents groups within competition phases (e.g., Group A, Group B in group stage)
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CompetitionGroupDocument = CompetitionGroup & Document;

export enum GroupStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Schema({ _id: false })
export class GroupRules {
  @ApiProperty()
  @Prop({ type: Number, default: 1 })
  matchesPerPairing: number;

  @ApiProperty()
  @Prop({ type: Boolean, default: true })
  roundRobin: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  tiebreakRules?: string;
}

@Schema({ _id: false })
export class GroupSchedule {
  @ApiProperty()
  @Prop({ type: Date, required: true })
  startDate: Date;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  endDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: [String] })
  matchDays?: string[];
}

@Schema({ _id: false })
export class GroupStandings {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String })
  teamName: string;

  @ApiProperty()
  @Prop({ type: String })
  teamCode: string;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  position: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  played: number;

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

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  matchesWon: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  matchesLost: number;
}

@Schema({ _id: false })
export class GroupQualification {
  @ApiProperty()
  @Prop({ type: Number, required: true })
  teamsAdvancing: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  qualificationCriteria?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'CompetitionPhase' })
  nextPhaseId?: Types.ObjectId;
}

@Schema({ _id: false })
export class GroupAuditInfo {
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
  collection: 'competition_groups',
  timestamps: true,
  versionKey: 'version',
})
export class CompetitionGroup {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  groupId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Competition', required: true, index: true })
  competitionId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'CompetitionPhase', required: true, index: true })
  phaseId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  code: string;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 1 })
  order: number;

  @ApiProperty({ enum: GroupStatus })
  @Prop({ type: String, enum: GroupStatus, required: true, default: GroupStatus.PENDING, index: true })
  status: GroupStatus;

  @ApiProperty()
  @Prop({ type: GroupRules, required: true })
  rules: GroupRules;

  @ApiProperty()
  @Prop({ type: GroupSchedule, required: true })
  schedule: GroupSchedule;

  @ApiProperty()
  @Prop({ type: GroupQualification, required: true })
  qualification: GroupQualification;

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'Team', default: [], index: true })
  teamIds: Types.ObjectId[];

  @ApiProperty()
  @Prop({ type: [GroupStandings], default: [] })
  standings: GroupStandings[];

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], ref: 'Match', default: [] })
  matchIds: Types.ObjectId[];

  @ApiProperty()
  @Prop({ type: GroupAuditInfo })
  audit: GroupAuditInfo;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const CompetitionGroupSchema = SchemaFactory.createForClass(CompetitionGroup);

// Indexes
CompetitionGroupSchema.index({ competitionId: 1, phaseId: 1, order: 1 });
CompetitionGroupSchema.index({ phaseId: 1, status: 1 });
CompetitionGroupSchema.index({ groupId: 1 }, { unique: true });
CompetitionGroupSchema.index({ teamIds: 1 });

// Virtual for isActive
CompetitionGroupSchema.virtual('isActive').get(function() {
  return this.status === 'in_progress';
});

// Virtual for isCompleted
CompetitionGroupSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Virtual for teamCount
CompetitionGroupSchema.virtual('teamCount').get(function() {
  return this.teamIds?.length || 0;
});