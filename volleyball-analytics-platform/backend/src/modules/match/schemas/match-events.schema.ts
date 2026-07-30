/**
 * Match Events & Timeline Schemas - Chapter 12 Part 2
 * 
 * MatchEvent: Individual events during a match (points, serves, attacks, etc.)
 * MatchTimeline: Chronological event timeline (append-only)
 * MatchSetResults: Per-set scores and statistics
 * MatchLineups: Starting lineup and substitutions
 * MatchSubstitutions: Player substitution records
 * MatchTimeouts: Team timeout records
 * MatchChallenges: Video challenge records
 * MatchSanctions: Card and penalty records
 * MatchIncidents: Injury and incident records
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MatchEventDocument = MatchEvent & Document;

export enum MatchEventType {
  // Point events
  POINT = 'point',
  SERVE = 'serve',
  ACE = 'ace',
  SERVICE_ERROR = 'service_error',
  
  // Attack events
  ATTACK = 'attack',
  KILL = 'kill',
  ATTACK_ERROR = 'attack_error',
  ATTACK_BLOCKED = 'attack_blocked',
  
  // Block events
  BLOCK = 'block',
  BLOCK_POINT = 'block_point',
  BLOCK_ERROR = 'block_error',
  
  // Defense events
  DIG = 'dig',
  EXCELLENT_DIG = 'excellent_dig',
  RECEPTION = 'reception',
  PERFECT_RECEPTION = 'perfect_reception',
  RECEPTION_ERROR = 'reception_error',
  
  // Set events
  SET = 'set',
  PERFECT_SET = 'perfect_set',
  SET_ERROR = 'set_error',
  
  // Team events
  SUBSTITUTION = 'substitution',
  TIMEOUT = 'timeout',
  TECHNICAL_TIMEOUT = 'technical_timeout',
  
  // Challenge events
  CHALLENGE = 'challenge',
  CHALLENGE_WON = 'challenge_won',
  CHALLENGE_LOST = 'challenge_lost',
  
  // Card events
  YELLOW_CARD = 'yellow_card',
  RED_CARD = 'red_card',
  
  // Injury events
  INJURY = 'injury',
  MEDICAL_TIMEOUT = 'medical_timeout',
  
  // Match structure events
  SET_START = 'set_start',
  SET_END = 'set_end',
  MATCH_START = 'match_start',
  MATCH_END = 'match_end',
  WARMUP_START = 'warmup_start',
  WARMUP_END = 'warmup_end',
  
  // Rotation & lineup
  ROTATION = 'rotation',
  LINEUP_CHANGE = 'lineup_change',
  LIBERO_REPLACEMENT = 'libero_replacement',
}

export enum EventSource {
  MANUAL = 'manual',
  AI_DETECTED = 'ai_detected',
  VIDEO_SYNCED = 'video_synced',
  OFFICIAL = 'official',
}

@Schema({ _id: false })
export class EventMetadata {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  zone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  subZone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  speed?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  height?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  technique?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  outcome?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  aiConfidence?: Record<string, number>;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  videoTimestamp?: string;
}

@Schema({ _id: false })
export class EventAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, required: true })
  recordedBy: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Date, required: true, default: Date.now })
  recordedAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  verifiedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  verifiedAt?: Date;

  @ApiProperty({ enum: EventSource })
  @Prop({ type: String, enum: EventSource, required: true, default: EventSource.MANUAL })
  source: EventSource;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  correlationId?: string;
}

@Schema({ 
  collection: 'match_events',
  timestamps: true,
  versionKey: 'version',
})
export class MatchEvent {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  eventId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, index: true })
  matchId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  teamId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Player' })
  playerId?: Types.ObjectId;

  @ApiProperty({ enum: MatchEventType })
  @Prop({ type: String, enum: MatchEventType, required: true, index: true })
  type: MatchEventType;

  @ApiProperty()
  @Prop({ type: Number, required: true, index: true })
  setNumber: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  timestamp: number; // milliseconds from match start

  @ApiProperty()
  @Prop({ type: Number, required: true })
  homeScore: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  awayScore: number;

  @ApiProperty({ type: EventMetadata })
  @Prop({ type: EventMetadata, default: {} })
  metadata: EventMetadata;

  @ApiProperty({ enum: EventSource })
  @Prop({ type: String, enum: EventSource, required: true, default: EventSource.MANUAL })
  source: EventSource;

  @ApiProperty()
  @Prop({ type: EventAuditInfo, required: true })
  audit: EventAuditInfo;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isChallenge: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  challengeResult?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  relatedEventId?: string;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchEventSchema = SchemaFactory.createForClass(MatchEvent);

// Indexes per 12.22
MatchEventSchema.index({ matchId: 1, setNumber: 1, timestamp: 1 });
MatchEventSchema.index({ matchId: 1, type: 1 });
MatchEventSchema.index({ matchId: 1, teamId: 1 });
MatchEventSchema.index({ matchId: 1, playerId: 1 });
MatchEventSchema.index({ eventId: 1 }, { unique: true });

// Immutability after recording
MatchEventSchema.pre('findOneAndUpdate', function() {
  throw new Error('Match events are immutable once recorded');
});

MatchEventSchema.pre('updateOne', function() {
  throw new Error('Match events are immutable once recorded');
});

// ============================================================================
// MATCH TIMELINE
// ============================================================================

export type MatchTimelineDocument = MatchTimeline & Document;

export enum TimelinePeriod {
  PRE_MATCH = 'pre_match',
  WARMUP = 'warmup',
  SET_1 = 'set_1',
  SET_2 = 'set_2',
  SET_3 = 'set_3',
  SET_4 = 'set_4',
  SET_5 = 'set_5',
  SET_BREAK = 'set_break',
  POST_MATCH = 'post_match',
}

@Schema({ _id: false })
export class TimelineEntry {
  @ApiProperty()
  @Prop({ type: String, required: true })
  id: string;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  timestamp: number;

  @ApiProperty({ enum: TimelinePeriod })
  @Prop({ type: String, enum: TimelinePeriod, required: true })
  period: TimelinePeriod;

  @ApiProperty()
  @Prop({ type: String, required: true })
  eventType: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty({ type: Types.ObjectId })
  @Prop({ type: Types.ObjectId })
  teamId?: Types.ObjectId;

  @ApiProperty({ type: Types.ObjectId })
  @Prop({ type: Types.ObjectId })
  playerId?: Types.ObjectId;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  data?: Record<string, any>;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  recordedAt: Date;
}

@Schema({ _id: false })
export class TimelineAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  version: number;
}

@Schema({ _id: false })
export class TimelineArchive {
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
  collection: 'match_timelines',
  timestamps: true,
  versionKey: 'version',
})
export class MatchTimeline {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  timelineId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, index: true })
  matchId: Types.ObjectId;

  @ApiProperty({ type: [TimelineEntry] })
  @Prop({ type: [TimelineEntry], default: [] })
  entries: TimelineEntry[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  currentPeriod?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  periodStartTime?: number;

  @ApiProperty()
  @Prop({ type: TimelineAuditInfo, required: true })
  audit: TimelineAuditInfo;

  @ApiProperty()
  @Prop({ type: TimelineArchive, required: true })
  archive: TimelineArchive;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchTimelineSchema = SchemaFactory.createForClass(MatchTimeline);

// Indexes
MatchTimelineSchema.index({ matchId: 1 }, { unique: true });
MatchTimelineSchema.index({ matchId: 1, 'entries.timestamp': 1 });
MatchTimelineSchema.index({ 'entries.timestamp': 1 });

// Immutability - timeline is append-only
MatchTimelineSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate();
  if (update && update.$pull) {
    throw new Error('Timeline entries cannot be removed - append only');
  }
});

// ============================================================================
// MATCH SET RESULTS
// ============================================================================

export type MatchSetResultDocument = MatchSetResult & Document;

export enum SetStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Schema({ _id: false })
export class SetStatistics {
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  totalPoints: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  totalRallies: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  averageRallyLength: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  longestRally: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  homeAttacks: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  awayAttacks: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  homeBlocks: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  awayBlocks: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  homeServes: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  awayServes: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  homeAces: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  awayAces: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  homeErrors: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  awayErrors: number;
}

@Schema({ _id: false })
export class SetAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  recordedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  verifiedBy?: Types.ObjectId;
}

@Schema({ 
  collection: 'match_set_results',
  timestamps: true,
  versionKey: 'version',
})
export class MatchSetResult {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  setResultId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, index: true })
  matchId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true, index: true })
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
  @Prop({ type: Date, required: true })
  startTime: Date;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  endTime: Date;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  eventIds: string[];

  @ApiProperty({ enum: SetStatus })
  @Prop({ type: String, enum: SetStatus, required: true, default: SetStatus.NOT_STARTED, index: true })
  status: SetStatus;

  @ApiProperty({ required: false, enum: ['home', 'away'] })
  @Prop({ type: String, enum: ['home', 'away'] })
  winningTeamSide?: 'home' | 'away';

  @ApiProperty({ type: SetStatistics })
  @Prop({ type: SetStatistics })
  stats?: SetStatistics;

  @ApiProperty()
  @Prop({ type: SetAuditInfo, required: true })
  audit: SetAuditInfo;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchSetResultSchema = SchemaFactory.createForClass(MatchSetResult);

// Indexes
MatchSetResultSchema.index({ matchId: 1, setNumber: 1 }, { unique: true });
MatchSetResultSchema.index({ matchId: 1, status: 1 });

// ============================================================================
// MATCH LINEUPS
// ============================================================================

export type MatchLineupDocument = MatchLineup & Document;

@Schema({ _id: false })
export class LineupPlayer {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  playerId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 1, max: 99 })
  jerseyNumber: number;

  @ApiProperty()
  @Prop({ type: String, required: true })
  position: string;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isCaptain: boolean;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isLibero: boolean;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isStarting: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  substitutionOrder?: number;
}

@Schema({ _id: false })
export class LineupAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  submittedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Date })
  submittedAt?: Date;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  verifiedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Date })
  verifiedAt?: Date;
}

@Schema({ _id: false })
export class LineupArchive {
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
  collection: 'match_lineups',
  timestamps: true,
  versionKey: 'version',
})
export class MatchLineup {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  lineupId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, index: true })
  matchId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  teamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  setNumber: number;

  @ApiProperty({ type: [LineupPlayer] })
  @Prop({ type: [LineupPlayer], required: true })
  players: LineupPlayer[];

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Player' })
  captainId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Player' })
  liberoId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Official' })
  coachId?: Types.ObjectId;

  @ApiProperty({ type: LineupAuditInfo })
  @Prop({ type: LineupAuditInfo, required: true })
  audit: LineupAuditInfo;

  @ApiProperty()
  @Prop({ type: LineupArchive, required: true })
  archive: LineupArchive;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchLineupSchema = SchemaFactory.createForClass(MatchLineup);

// Indexes
MatchLineupSchema.index({ matchId: 1, teamId: 1, setNumber: 1 }, { unique: true });
MatchLineupSchema.index({ matchId: 1, setNumber: 1 });

// Validation: exactly 6 starting players, max 12 total
MatchLineupSchema.pre('save', function(next) {
  const starters = this.players.filter(p => p.isStarting).length;
  if (starters !== 6) {
    return next(new Error(`Must have exactly 6 starting players, got ${starters}`));
  }
  if (this.players.length > 12) {
    return next(new Error(`Maximum 12 players per lineup, got ${this.players.length}`));
  }
  const liberoCount = this.players.filter(p => p.isLibero).length;
  if (liberoCount > 1) {
    return next(new Error(`Maximum 1 libero per lineup, got ${liberoCount}`));
  }
  next();
});

// ============================================================================
// MATCH SUBSTITUTIONS
// ============================================================================

export type MatchSubstitutionDocument = MatchSubstitution & Document;

export enum SubstitutionType {
  REGULAR = 'regular',
  LIBERO_REPLACEMENT = 'libero_replacement',
  INJURY = 'injury',
  EXCEPTIONAL = 'exceptional',
}

@Schema({ _id: false })
export class SubstitutionAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  recordedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  recordedAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  verifiedBy?: Types.ObjectId;
}

@Schema({ 
  collection: 'match_substitutions',
  timestamps: true,
  versionKey: 'version',
})
export class MatchSubstitution {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  substitutionId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, index: true })
  matchId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true, index: true })
  setNumber: number;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  teamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  playerOutId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  playerInId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 1, max: 99 })
  playerOutJerseyNumber: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, min: 1, max: 99 })
  playerInJerseyNumber: number;

  @ApiProperty({ enum: SubstitutionType })
  @Prop({ type: String, enum: SubstitutionType, required: true })
  type: SubstitutionType;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  timestamp: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  homeScore: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  awayScore: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  reason?: string;

  @ApiProperty({ type: SubstitutionAuditInfo })
  @Prop({ type: SubstitutionAuditInfo, required: true })
  audit: SubstitutionAuditInfo;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchSubstitutionSchema = SchemaFactory.createForClass(MatchSubstitution);

// Indexes
MatchSubstitutionSchema.index({ matchId: 1, setNumber: 1, timestamp: 1 });
MatchSubstitutionSchema.index({ matchId: 1, teamId: 1 });

// Validation: team substitution count limit (6 per set)
MatchSubstitutionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({
      matchId: this.matchId,
      setNumber: this.setNumber,
      teamId: this.teamId,
      type: { $ne: SubstitutionType.LIBERO_REPLACEMENT },
    });
    if (count >= 6) {
      return next(new Error('Team has reached maximum of 6 substitutions per set'));
    }
  }
  next();
});

// ============================================================================
// MATCH TIMEOUTS
// ============================================================================

export type MatchTimeoutDocument = MatchTimeout & Document;

export enum TimeoutType {
  REGULAR = 'regular',
  TECHNICAL = 'technical',
  MEDICAL = 'medical',
}

@Schema({ _id: false })
export class TimeoutAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  recordedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  recordedAt: Date;
}

@Schema({ 
  collection: 'match_timeouts',
  timestamps: true,
  versionKey: 'version',
})
export class MatchTimeout {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  timeoutId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, index: true })
  matchId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  setNumber: number;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  teamId: Types.ObjectId;

  @ApiProperty({ enum: TimeoutType })
  @Prop({ type: String, enum: TimeoutType, required: true })
  type: TimeoutType;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  timestamp: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  homeScore: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  awayScore: number;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 30 })
  durationSeconds: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  remainingTimeouts: number;

  @ApiProperty({ type: TimeoutAuditInfo })
  @Prop({ type: TimeoutAuditInfo, required: true })
  audit: TimeoutAuditInfo;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchTimeoutSchema = SchemaFactory.createForClass(MatchTimeout);

// Indexes
MatchTimeoutSchema.index({ matchId: 1, setNumber: 1, timestamp: 1 });
MatchTimeoutSchema.index({ matchId: 1, teamId: 1 });

// ============================================================================
// MATCH CHALLENGES
// ============================================================================

export type MatchChallengeDocument = MatchChallenge & Document;

export enum ChallengeType {
  BALL_IN_OUT = 'ball_in_out',
  TOUCH = 'touch',
  NET_TOUCH = 'net_touch',
  CENTER_LINE = 'center_line',
  FOOT_FAULT = 'foot_fault',
  ROTATION = 'rotation',
  ROTATION_ORDER = 'rotation_order',
}

export enum ChallengeResult {
  PENDING = 'pending',
  UPHELD = 'upheld',
  OVERTURNED = 'overturned',
  INCONCLUSIVE = 'inconclusive',
}

@Schema({ _id: false })
export class ChallengeAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  requestedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  requestedAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  reviewedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  reviewedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  videoEvidenceId?: string;
}

@Schema({ 
  collection: 'match_challenges',
  timestamps: true,
  versionKey: 'version',
})
export class MatchChallenge {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  challengeId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, index: true })
  matchId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  setNumber: number;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true, index: true })
  teamId: Types.ObjectId;

  @ApiProperty({ enum: ChallengeType })
  @Prop({ type: String, enum: ChallengeType, required: true })
  type: ChallengeType;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  timestamp: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  homeScore: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  awayScore: number;

  @ApiProperty({ enum: ChallengeResult })
  @Prop({ type: String, enum: ChallengeResult, required: true, default: ChallengeResult.PENDING, index: true })
  result: ChallengeResult;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  videoEvidenceId?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  reason?: string;

  @ApiProperty({ type: ChallengeAuditInfo })
  @Prop({ type: ChallengeAuditInfo, required: true })
  audit: ChallengeAuditInfo;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchChallengeSchema = SchemaFactory.createForClass(MatchChallenge);

// Indexes
MatchChallengeSchema.index({ matchId: 1, setNumber: 1, timestamp: 1 });
MatchChallengeSchema.index({ matchId: 1, teamId: 1, result: 1 });

// Validation: team challenges limit (2 per set)
MatchChallengeSchema.pre('save', async function(next) {
  if (this.isNew && this.result === ChallengeResult.PENDING) {
    const count = await this.constructor.countDocuments({
      matchId: this.matchId,
      setNumber: this.setNumber,
      teamId: this.teamId,
      result: { $in: [ChallengeResult.PENDING, ChallengeResult.UPHELD] },
    });
    if (count >= 2) {
      return next(new Error('Team has reached maximum of 2 challenges per set'));
    }
  }
  next();
});

// ============================================================================
// MATCH SANCTIONS (Cards)
// ============================================================================

export type MatchSanctionDocument = MatchSanction & Document;

export enum SanctionType {
  YELLOW_CARD = 'yellow_card',
  RED_CARD = 'red_card',
  WARNING = 'warning',
  PENALTY = 'penalty',
}

export enum SanctionReason {
  UNSPORTING_CONDUCT = 'unsporting_conduct',
  DELAY = 'delay',
  DISSENT = 'dissent',
  VIOLENT_CONDUCT = 'violent_conduct',
  TECHNICAL_VIOLATION = 'technical_violation',
}

@Schema({ 
  collection: 'match_sanctions',
  timestamps: true,
  versionKey: 'version',
})
export class MatchSanction {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  sanctionId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, index: true })
  matchId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  setNumber: number;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Player' })
  playerId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Official' })
  officialId?: Types.ObjectId;

  @ApiProperty({ enum: SanctionType })
  @Prop({ type: String, enum: SanctionType, required: true, index: true })
  type: SanctionType;

  @ApiProperty({ enum: SanctionReason })
  @Prop({ type: String, enum: SanctionReason, required: true })
  reason: SanctionReason;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  timestamp: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  homeScore: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  awayScore: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchSanctionSchema = SchemaFactory.createForClass(MatchSanction);

// Indexes
MatchSanctionSchema.index({ matchId: 1, setNumber: 1, timestamp: 1 });
MatchSanctionSchema.index({ matchId: 1, teamId: 1 });

// ============================================================================
// MATCH INCIDENTS
// ============================================================================

export type MatchIncidentDocument = MatchIncident & Document;

export enum IncidentType {
  INJURY = 'injury',
  ILLNESS = 'illness',
  EQUIPMENT_FAILURE = 'equipment_failure',
  POWER_OUTAGE = 'power_outage',
  WEATHER = 'weather',
  CROWD_DISTURBANCE = 'crowd_disturbance',
  TECHNICAL_ISSUE = 'technical_issue',
  OTHER = 'other',
}

export enum IncidentSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical',
}

@Schema({ _id: false })
export class IncidentAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  reportedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  reportedAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  reviewedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  reviewedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  resolution?: string;
}

@Schema({ 
  collection: 'match_incidents',
  timestamps: true,
  versionKey: 'version',
})
export class MatchIncident {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  incidentId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, index: true })
  matchId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  setNumber: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  timestamp: number;

  @ApiProperty({ enum: IncidentType })
  @Prop({ type: String, enum: IncidentType, required: true, index: true })
  type: IncidentType;

  @ApiProperty({ enum: IncidentSeverity })
  @Prop({ type: String, enum: IncidentSeverity, required: true, default: IncidentSeverity.MODERATE })
  severity: IncidentSeverity;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Team' })
  teamId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Player' })
  playerId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  actionTaken?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  delayMinutes?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean })
  matchStopped?: boolean;

  @ApiProperty({ type: IncidentAuditInfo })
  @Prop({ type: IncidentAuditInfo, required: true })
  audit: IncidentAuditInfo;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchIncidentSchema = SchemaFactory.createForClass(MatchIncident);

// Indexes
MatchIncidentSchema.index({ matchId: 1, setNumber: 1, timestamp: 1 });
MatchIncidentSchema.index({ matchId: 1, severity: 1 });