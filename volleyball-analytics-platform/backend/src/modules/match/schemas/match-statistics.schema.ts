/**
 * Match Statistics Schema - Chapter 12 Part 2
 * 
 * Comprehensive statistics for matches, teams, and players.
 * Shall serve as the authoritative source for all statistical queries.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MatchStatisticsDocument = MatchStatistics & Document;

export enum StatisticsStatus {
  PENDING = 'pending',
  CALCULATING = 'calculating',
  FINALIZED = 'finalized',
  ARCHIVED = 'archived',
}

@Schema({ _id: false })
export class TeamMatchStatistics {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  teamName: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  teamCode: string;

  // Set Results
  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  setsWon: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  setsLost: number;

  @ApiProperty({ type: [Number] })
  @Prop({ type: [Number], default: [] })
  setScores: number[];

  // Detailed Statistics
  @ApiProperty()
  @Prop({ type: Number, required: true, default: 0 })
  totalPoints: number;

  // Attack
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  attacks: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  attackPoints: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  attackErrors: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  attackBlocked: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  attackEfficiency: number;

  // Block
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  blocks: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  blockPoints: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  blockErrors: number;

  // Serve
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  serves: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  aces: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  serveErrors: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  serveEfficiency: number;

  // Reception
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  receptions: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  perfectReceptions: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  receptionErrors: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  receptionEfficiency: number;

  // Dig
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  digs: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  excellentDigs: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  digEfficiency: number;

  // Set
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  sets: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  perfectSets: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  setErrors: number;

  // Timeout & Substitution
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  timeoutsUsed: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  substitutionsUsed: number;
}

@Schema({ _id: false })
export class PlayerMatchStatistics {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  playerId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  jerseyNumber: number;

  @ApiProperty()
  @Prop({ type: String, required: true })
  position: string;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isStarter: boolean;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isCaptain: boolean;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isLibero: boolean;

  // Points
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  totalPoints: number;

  // Attack
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  attacks: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  attackPoints: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  attackErrors: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  attackBlocked: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  attackEfficiency: number;

  // Block
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  blocks: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  blockPoints: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  blockErrors: number;

  // Serve
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  serves: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  aces: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  serveErrors: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  serveEfficiency: number;

  // Reception
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  receptions: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  perfectReceptions: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  receptionErrors: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  receptionEfficiency: number;

  // Dig
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  digs: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  excellentDigs: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  digEfficiency: number;

  // Set
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  sets: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  perfectSets: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  setErrors: number;

  // Time on court
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  timeOnCourt: number; // seconds

  // Substitution info
  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  wasSubstituted: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  substitutedFor?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  substitutionTime?: number;
}

@Schema({ _id: false })
export class SetStatistics {
  @ApiProperty()
  @Prop({ type: Number, required: true })
  setNumber: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  homeScore: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  awayScore: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  durationMinutes: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  totalRallies: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  averageRallyLength: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  longestRally: number;

  @ApiProperty({ type: TeamMatchStatistics })
  @Prop({ type: TeamMatchStatistics })
  homeTeamStats: TeamMatchStatistics;

  @ApiProperty({ type: TeamMatchStatistics })
  @Prop({ type: TeamMatchStatistics })
  awayTeamStats: TeamMatchStatistics;

  @ApiProperty()
  @Prop({ type: Date })
  startTime: Date;

  @ApiProperty()
  @Prop({ type: Date })
  endTime: Date;
}

@Schema({ _id: false })
export class MatchStatisticsAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  finalizedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  version: number;
}

@Schema({ _id: false })
export class MatchStatisticsArchive {
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
  collection: 'match_statistics',
  timestamps: true,
  versionKey: 'version',
})
export class MatchStatistics {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  statisticsId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, index: true })
  matchId: Types.ObjectId;

  @ApiProperty({ type: TeamMatchStatistics })
  @Prop({ type: TeamMatchStatistics, required: true })
  homeTeam: TeamMatchStatistics;

  @ApiProperty({ type: TeamMatchStatistics })
  @Prop({ type: TeamMatchStatistics, required: true })
  awayTeam: TeamMatchStatistics;

  @ApiProperty({ type: [PlayerMatchStatistics] })
  @Prop({ type: [PlayerMatchStatistics], default: [] })
  players: PlayerMatchStatistics[];

  @ApiProperty({ type: [SetStatistics] })
  @Prop({ type: [SetStatistics], default: [] })
  sets: SetStatistics[];

  @ApiProperty({ enum: StatisticsStatus })
  @Prop({ type: String, enum: StatisticsStatus, required: true, default: StatisticsStatus.PENDING, index: true })
  status: StatisticsStatus;

  @ApiProperty()
  @Prop({ type: MatchStatisticsAuditInfo, required: true })
  audit: MatchStatisticsAuditInfo;

  @ApiProperty()
  @Prop({ type: MatchStatisticsArchive, required: true })
  archive: MatchStatisticsArchive;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchStatisticsSchema = SchemaFactory.createForClass(MatchStatistics);

// Indexes per 12.22
MatchStatisticsSchema.index({ matchId: 1 }, { unique: true });
MatchStatisticsSchema.index({ 'homeTeam.teamId': 1 });
MatchStatisticsSchema.index({ 'awayTeam.teamId': 1 });
MatchStatisticsSchema.index({ 'players.playerId': 1 });
MatchStatisticsSchema.index({ status: 1 });
MatchStatisticsSchema.index({ statisticsId: 1 }, { unique: true });

// Virtual for total duration
MatchStatisticsSchema.virtual('totalDuration').get(function() {
  return this.sets.reduce((sum, set) => sum + set.durationMinutes, 0);
});

// Virtual for isFinalized
MatchStatisticsSchema.virtual('isFinalized').get(function() {
  return this.status === StatisticsStatus.FINALIZED || this.status === StatisticsStatus.ARCHIVED;
});

// Validation: Ensure all players belong to home or away team
MatchStatisticsSchema.pre('save', function(next) {
  const teamIds = new Set([this.homeTeam.teamId.toString(), this.awayTeam.teamId.toString()]);
  
  for (const player of this.players) {
    if (!teamIds.has(player.teamId.toString())) {
      return next(new Error(`Player ${player.playerId} does not belong to either team`));
    }
  }
  next();
});