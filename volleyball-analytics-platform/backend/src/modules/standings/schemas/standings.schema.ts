/**
 * Standings Schema - Chapter 12 Part 1
 * 
 * Competition standings with support for different ranking systems
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type StandingsDocument = Standings & Document;

export enum StandingType {
  OVERALL = 'overall',
  HOME = 'home',
  AWAY = 'away',
  GROUP = 'group',
  PHASE = 'phase',
}

@Schema({ _id: false })
export class StandingEntry {
  @ApiProperty()
  @Prop({ type: Number, required: true })
  position: number;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  teamName: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  teamShortName: string;

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
  points: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  setsWon: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  setsLost: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  setRatio: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  pointsFor: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  pointsAgainst: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  pointRatio: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  form: number;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  recentResults: string[]; // W, L, D

  @ApiProperty({ required: false })
  @Prop({ type: String })
  qualification?: string; // Q, q, EL, etc.

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  homeWins: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  homeLosses: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  awayWins: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  awayLosses: number;
}

@Schema({ _id: false })
export class TiebreakRule {
  @ApiProperty()
  @Prop({ type: Number, required: true })
  priority: number;

  @ApiProperty()
  @Prop({ type: String, required: true })
  criteria: string; // points, set_ratio, point_ratio, head_to_head, etc.

  @ApiProperty()
  @Prop({ type: String, required: true })
  direction: 'desc' | 'asc';

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;
}

@Schema({ _id: false })
export class StandingAuditInfo {
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
  collection: 'standings',
  timestamps: true,
  versionKey: 'version',
})
export class Standings {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  standingsId: string;

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

  @ApiProperty({ enum: StandingType })
  @Prop({ type: String, enum: StandingType, required: true, index: true })
  type: StandingType;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: [StandingEntry], default: [] })
  entries: StandingEntry[];

  @ApiProperty({ type: [TiebreakRule] })
  @Prop({ type: [TiebreakRule], default: [] })
  tiebreakRules: TiebreakRule[];

  @ApiProperty()
  @Prop({ type: Boolean, default: false })
  isFinal: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastUpdated?: Date;

  @ApiProperty()
  @Prop({ type: StandingAuditInfo })
  audit: StandingAuditInfo;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const StandingsSchema = SchemaFactory.createForClass(Standings);

// Indexes
StandingsSchema.index({ competitionId: 1, type: 1 });
StandingsSchema.index({ competitionId: 1, groupId: 1 });
StandingsSchema.index({ seasonId: 1, type: 1 });
StandingsSchema.index({ standingsId: 1 }, { unique: true });

// Virtual for topTeams
StandingsSchema.virtual('topTeams').get(function(this: any) {
  return this.entries
    .sort((a: any, b: any) => a.position - b.position)
    .slice(0, 4);
});

// Virtual for bottomTeams
StandingsSchema.virtual('bottomTeams').get(function(this: any) {
  return this.entries
    .sort((a: any, b: any) => b.position - a.position)
    .slice(0, 4);
});

// Virtual for qualifiedTeams
StandingsSchema.virtual('qualifiedTeams').get(function(this: any) {
  return this.entries
    .filter((e: any) => e.qualification && e.qualification.startsWith('Q'))
    .sort((a: any, b: any) => a.position - b.position);
});

// Virtual for eliminatedTeams
StandingsSchema.virtual('eliminatedTeams').get(function(this: any) {
  return this.entries
    .filter((e: any) => e.qualification === 'EL')
    .sort((a: any, b: any) => b.position - a.position);
});