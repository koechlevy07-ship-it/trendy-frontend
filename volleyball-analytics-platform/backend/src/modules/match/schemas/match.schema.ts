/**
 * Match Schema - Chapter 12 Part 1
 * 
 * Core match domain model for the Match & Competition Management Module.
 * Serves as the central reference for all live gameplay and analytics.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MatchDocument = Match & Document;

export enum MatchStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  WARMUP = 'warmup',
  IN_PROGRESS = 'in_progress',
  SET_BREAK = 'set_break',
  SUSPENDED = 'suspended',
  POSTPONED = 'postponed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  VALIDATING = 'validating',
  ARCHIVED = 'archived',
}

export enum MatchType {
  REGULAR = 'regular',
  PLAYOFF = 'playoff',
  FINAL = 'final',
  SEMIFINAL = 'semifinal',
  QUARTERFINAL = 'quarterfinal',
  THIRD_PLACE = 'third_place',
  QUALIFICATION = 'qualification',
  FRIENDLY = 'friendly',
  EXHIBITION = 'exhibition',
  TRAINING = 'training',
}

export enum SetStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum VideoSyncStatus {
  NOT_SYNCED = 'not_synced',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed',
}

@Schema({ _id: false })
export class MatchIdentity {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  matchId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  matchCode: string;

  @ApiProperty({ enum: MatchType })
  @Prop({ type: String, enum: MatchType, required: true, default: MatchType.REGULAR })
  type: MatchType;

  @ApiProperty()
  @Prop({ type: Number, required: true, default: 1 })
  round: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  matchNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  displayName?: string;
}

@Schema({ _id: false })
export class CompetitionReference {
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
}

@Schema({ _id: false })
export class TeamAssignment {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  teamName: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  shortName: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  teamCode: string;

  @ApiProperty({ enum: ['home', 'away'] })
  @Prop({ type: String, enum: ['home', 'away'], required: true })
  side: 'home' | 'away';

  @ApiProperty()
  @Prop({ type: String })
  logoUrl?: string;

  @ApiProperty({ type: () => TeamMatchStats })
  @Prop({ type: TeamMatchStats, required: true })
  stats: TeamMatchStats;

  @ApiProperty({ type: () => TeamLineup })
  @Prop({ type: TeamLineup, required: true })
  lineup: TeamLineup;
}

@Schema({ _id: false })
export class TeamMatchStats {
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  setsWon: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  setsLost: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  pointsWon: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  pointsLost: number;

  @ApiProperty({ type: [Number] })
  @Prop({ type: [Number], default: [] })
  setScores: number[];

  @ApiProperty({ type: () => DetailedTeamStats })
  @Prop({ type: DetailedTeamStats })
  detailedStats?: DetailedTeamStats;
}

@Schema({ _id: false })
export class DetailedTeamStats {
  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  attacks: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  attackPoints: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  attackErrors: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  blocks: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  blockPoints: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  blockErrors: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  serves: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  aces: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  serveErrors: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  receptions: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  perfectReceptions: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  receptionErrors: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  digs: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  excellentDigs: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  sets: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  perfectSets: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  setErrors: number;
}

@Schema({ _id: false })
export class TeamLineup {
  @ApiProperty({ type: [PlayerAssignment] })
  @Prop({ type: [PlayerAssignment], default: [] })
  starters: PlayerAssignment[];

  @ApiProperty({ type: [PlayerAssignment] })
  @Prop({ type: [PlayerAssignment], default: [] })
  substitutes: PlayerAssignment[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  captainId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  liberoId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  coachId?: Types.ObjectId;
}

@Schema({ _id: false })
export class PlayerAssignment {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  playerId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true })
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

  @ApiProperty({ type: PlayerMatchStats })
  @Prop({ type: PlayerMatchStats })
  stats?: PlayerMatchStats;
}

@Schema({ _id: false })
export class PlayerMatchStats {
  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  points: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  attacks: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  blocks: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  serves: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  receptions: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  digs: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  sets: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  errors: number;
}

@Schema({ _id: false })
export class Venue {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Facility', required: true })
  facilityId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String })
  courtName?: string;

  @ApiProperty({ type: () => CourtConfiguration })
  @Prop({ type: CourtConfiguration, required: true })
  configuration: CourtConfiguration;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  environment?: Record<string, any>;
}

@Schema({ _id: false })
export class CourtConfiguration {
  @ApiProperty()
  @Prop({ type: String, required: true })
  surface: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  dimensions: string;

  @ApiProperty({ type: [CameraPosition] })
  @Prop({ type: [CameraPosition], default: [] })
  cameraPositions: CameraPosition[];

  @ApiProperty({ type: LightingConfig })
  @Prop({ type: LightingConfig })
  lighting?: LightingConfig;
}

@Schema({ _id: false })
export class CameraPosition {
  @ApiProperty()
  @Prop({ type: String, required: true })
  id: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  position: [number, number, number]; // x, y, z

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  rotation: [number, number, number]; // pitch, yaw, roll

  @ApiProperty({ type: CameraConfig })
  @Prop({ type: CameraConfig })
  config?: CameraConfig;
}

@Schema({ _id: false })
export class CameraConfig {
  @ApiProperty()
  @Prop({ type: String })
  model: string;

  @ApiProperty()
  @Prop({ type: Number })
  fps: number;

  @ApiProperty()
  @Prop({ type: String })
  resolution: string;

  @ApiProperty()
  @Prop({ type: String })
  encoding: string;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  autoFocus: boolean;
}

@Schema({ _id: false })
export class LightingConfig {
  @ApiProperty()
  @Prop({ type: Number })
  lux: number;

  @ApiProperty()
  @Prop({ type: String })
  temperature: string;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String] })
  zones: string[];
}

@Schema({ _id: false })
export class Officials {
  @ApiProperty({ type: OfficialAssignment })
  @Prop({ type: OfficialAssignment })
  firstReferee?: OfficialAssignment;

  @ApiProperty({ type: OfficialAssignment })
  @Prop({ type: OfficialAssignment })
  secondReferee?: OfficialAssignment;

  @ApiProperty({ type: OfficialAssignment, required: false })
  @Prop({ type: OfficialAssignment })
  challengeReferee?: OfficialAssignment;

  @ApiProperty({ type: [OfficialAssignment] })
  @Prop({ type: [OfficialAssignment], default: [] })
  lineJudges: OfficialAssignment[];

  @ApiProperty({ type: OfficialAssignment, required: false })
  @Prop({ type: OfficialAssignment })
  scorer?: OfficialAssignment;

  @ApiProperty({ type: OfficialAssignment, required: false })
  @Prop({ type: OfficialAssignment })
  assistantScorer?: OfficialAssignment;

  @ApiProperty({ type: OfficialAssignment, required: false })
  @Prop({ type: OfficialAssignment })
  courtManager?: OfficialAssignment;
}

@Schema({ _id: false })
export class OfficialAssignment {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Official', required: true })
  officialId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String })
  federation?: string;

  @ApiProperty()
  @Prop({ type: String })
  certificationLevel?: string;
}

@Schema({ _id: false })
export class Schedule {
  @ApiProperty()
  @Prop({ type: Date, required: true, index: true })
  scheduledStart: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  estimatedEndDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  actualStart?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  actualEnd?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  durationMinutes?: number;

  @ApiProperty({ type: [Date] })
  @Prop({ type: [Date] })
  setStartTimes: Date[];

  @ApiProperty({ type: [Date] })
  @Prop({ type: [Date] })
  setEndTimes: Date[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  timeZone?: string;
}

@Schema({ _id: false })
export class MatchEvent {
  @ApiProperty()
  @Prop({ type: String, required: true })
  eventId: string;

  @ApiProperty({ enum: MatchEventType })
  @Prop({ type: String, enum: MatchEventType, required: true })
  type: MatchEventType;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Player' })
  playerId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  setNumber: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  timestamp: number; // milliseconds from match start

  @ApiProperty()
  @Prop({ type: Number })
  homeScore: number;

  @ApiProperty()
  @Prop({ type: Number })
  awayScore: number;

  @ApiProperty()
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  recordedAt: Date;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Official' })
  verifiedBy?: Types.ObjectId;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isChallenge: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  challengeResult?: string;
}

export enum MatchEventType {
  POINT = 'point',
  SERVE = 'serve',
  ATTACK = 'attack',
  BLOCK = 'block',
  DIG = 'dig',
  SET = 'set',
  RECEPTION = 'reception',
  SUBSTITUTION = 'substitution',
  TIMEOUT = 'timeout',
  TECHNICAL_TIMEOUT = 'technical_timeout',
  CHALLENGE = 'challenge',
  CARD = 'card',
  INJURY = 'injury',
  SET_START = 'set_start',
  SET_END = 'set_end',
  MATCH_START = 'match_start',
  MATCH_END = 'match_end',
  ROTATION = 'rotation',
  LINEUP_CHANGE = 'lineup_change',
}

@Schema({ _id: false })
export class SetResult {
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
  @Prop({ type: Date })
  startTime: Date;

  @ApiProperty()
  @Prop({ type: Date })
  endTime: Date;

  @ApiProperty({ type: [MatchEvent] })
  @Prop({ type: [MatchEvent], default: [] })
  events: MatchEvent[];

  @ApiProperty({ enum: SetStatus })
  @Prop({ type: String, enum: SetStatus, default: SetStatus.NOT_STARTED })
  status: SetStatus;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  winningTeamSide?: 'home' | 'away';

  @ApiProperty({ type: () => SetStats })
  @Prop({ type: SetStats })
  stats?: SetStats;
}

@Schema({ _id: false })
export class SetStats {
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
}

@Schema({ _id: false })
export class AIMetadata {
  @ApiProperty()
  @Prop({ type: String })
  matchId: string;

  @ApiProperty({ type: () => VideoSyncInfo })
  @Prop({ type: VideoSyncInfo })
  videoSync?: VideoSyncInfo;

  @ApiProperty({ type: [StreamConfig] })
  @Prop({ type: [StreamConfig], default: [] })
  streams: StreamConfig[];

  @ApiProperty({ type: () => AIConfig })
  @Prop({ type: AIConfig })
  config?: AIConfig;

  @ApiProperty({ type: () => AnalyticsConfig })
  @Prop({ type: AnalyticsConfig })
  analytics?: AnalyticsConfig;
}

@Schema({ _id: false })
export class VideoSyncInfo {
  @ApiProperty({ enum: VideoSyncStatus })
  @Prop({ type: String, enum: VideoSyncStatus, default: VideoSyncStatus.NOT_SYNCED })
  status: VideoSyncStatus;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  syncedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  offsetMs?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  syncMethod?: string;
}

@Schema({ _id: false })
export class StreamConfig {
  @ApiProperty()
  @Prop({ type: String, required: true })
  streamId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  url: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  protocol: string; // RTMP, HLS, WebRTC, SRT

  @ApiProperty()
  @Prop({ type: String })
  resolution: string;

  @ApiProperty()
  @Prop({ type: Number })
  fps: number;

  @ApiProperty()
  @Prop({ type: Number })
  bitrate: number;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  isPrimary: boolean;
}

@Schema({ _id: false })
export class AIConfig {
  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: ['pose_estimation', 'ball_tracking', 'event_detection', 'player_identification', 'statistics_generation'] })
  enabledModules: string[];

  @ApiProperty()
  @Prop({ type: Number, default: 0.8 })
  confidenceThreshold: number;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  realTimeProcessing: boolean;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  customConfig?: Record<string, any>;
}

@Schema({ _id: false })
export class AnalyticsConfig {
  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  generateHeatmaps: boolean;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  generateShotCharts: boolean;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  generatePerformanceMetrics: boolean;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  trackMomentum: boolean;

  @ApiProperty({ default: true })
  @Prop({ type: Boolean, default: true })
  detectPatterns: boolean;
}

@Schema({ _id: false })
export class StatisticsReference {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  matchStatsId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  teamStatsHomeId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  teamStatsAwayId?: Types.ObjectId;

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], default: [] })
  playerStatsIds: Types.ObjectId[];

  @ApiProperty({ type: [Types.ObjectId] })
  @Prop({ type: [Types.ObjectId], default: [] })
  rallyIds: Types.ObjectId[];

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastCalculatedAt?: Date;
}

@Schema({ _id: false })
export class VideoReference {
  @ApiProperty({ type: String })
  @Prop({ type: String })
  matchVideoId?: string;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  highlightIds: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  challengeVideoIds: string[];

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], default: [] })
  analysisVideoIds: string[];
}

@Schema({ _id: false })
export class EventTimeline {
  @ApiProperty({ type: [TimelineEntry] })
  @Prop({ type: [TimelineEntry], default: [] })
  entries: TimelineEntry[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  currentPeriod?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  periodStartTime?: number;
}

@Schema({ _id: false })
export class TimelineEntry {
  @ApiProperty()
  @Prop({ type: String, required: true })
  id: string;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  timestamp: number;

  @ApiProperty()
  @Prop({ type: String, required: true })
  period: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  eventType: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty()
  @Prop({ type: Object })
  data?: Record<string, any>;
}

@Schema({ _id: false })
export class AuditInfo {
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
export class HistoricalArchive {
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

@Schema({ _id: false })
export class MatchStatusInfo {
  @ApiProperty({ enum: MatchStatus })
  @Prop({ type: String, enum: MatchStatus, required: true, default: MatchStatus.DRAFT, index: true })
  status: MatchStatus;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  previousStatus?: MatchStatus;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  statusChangedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  statusChangedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  statusChangeReason?: string;
}

@Schema({ _id: false })
export class LiveMatchData {
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  currentSet: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  homeSetScore: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  awaySetScore: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  homePointScore: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  awayPointScore: number;

  @ApiProperty()
  @Prop({ type: String, enum: ['home', 'away'] })
  servingTeam?: 'home' | 'away';

  @ApiProperty()
  @Prop({ type: Number })
  rotation?: number;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isTimeout: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  timeoutTeam?: string;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  remainingTimeoutsHome: number;

  @ApiProperty({ type: Number })
  @Prop({ type: Number, default: 0 })
  remainingTimeoutsAway: number;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  momentum?: Record<string, number>;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  pressureIndex?: Record<string, number>;
}

// ============================================================================
// MAIN MATCH SCHEMA
// ============================================================================

@Schema({ 
  collection: 'matches',
  timestamps: true,
  versionKey: 'version',
})
export class Match {
  @ApiProperty()
  @Prop({ type: MatchIdentity, required: true })
  identity: MatchIdentity;

  @ApiProperty()
  @Prop({ type: CompetitionReference, required: true })
  competition: CompetitionReference;

  @ApiProperty()
  @Prop({ type: TeamAssignment, required: true })
  homeTeam: TeamAssignment;

  @ApiProperty()
  @Prop({ type: TeamAssignment, required: true })
  awayTeam: TeamAssignment;

  @ApiProperty()
  @Prop({ type: Venue, required: true })
  venue: Venue;

  @ApiProperty()
  @Prop({ type: Officials, required: true })
  officials: Officials;

  @ApiProperty()
  @Prop({ type: Schedule, required: true })
  schedule: Schedule;

  @ApiProperty({ enum: MatchStatus })
  @Prop({ type: String, enum: MatchStatus, required: true, default: MatchStatus.DRAFT, index: true })
  status: MatchStatus;

  @ApiProperty()
  @Prop({ type: MatchStatusInfo, required: true })
  statusInfo: MatchStatusInfo;

  @ApiProperty({ type: [SetResult], default: [] })
  @Prop({ type: [SetResult], default: [] })
  sets: SetResult[];

  @ApiProperty({ type: [MatchEvent], default: [] })
  @Prop({ type: [MatchEvent], default: [] })
  events: MatchEvent[];

  @ApiProperty()
  @Prop({ type: LiveMatchData })
  liveData: LiveMatchData;

  @ApiProperty()
  @Prop({ type: AIMetadata })
  aiMetadata: AIMetadata;

  @ApiProperty()
  @Prop({ type: StatisticsReference })
  statistics: StatisticsReference;

  @ApiProperty()
  @Prop({ type: VideoReference })
  videos: VideoReference;

  @ApiProperty()
  @Prop({ type: EventTimeline })
  timeline: EventTimeline;

  @ApiProperty()
  @Prop({ type: AuditInfo })
  audit: AuditInfo;

  @ApiProperty()
  @Prop({ type: HistoricalArchive })
  archive: HistoricalArchive;

  @ApiProperty()
  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// Indexes
MatchSchema.index({ 'competition.competitionId': 1, 'schedule.scheduledStart': 1 });
MatchSchema.index({ 'competition.seasonId': 1, status: 1 });
MatchSchema.index({ 'homeTeam.teamId': 1, 'schedule.scheduledStart': 1 });
MatchSchema.index({ 'awayTeam.teamId': 1, 'schedule.scheduledStart': 1 });
MatchSchema.index({ 'venue.facilityId': 1, 'schedule.scheduledStart': 1 });
MatchSchema.index({ 'officials.firstReferee.officialId': 1 });
MatchSchema.index({ 'officials.secondReferee.officialId': 1 });
MatchSchema.index({ status: 1, 'schedule.scheduledStart': 1 });
MatchSchema.index({ 'identity.matchId': 1 }, { unique: true });
MatchSchema.index({ 'identity.matchCode': 1 });
MatchSchema.index({ 'schedule.actualStart': 1 });
MatchSchema.index({ 'aiMetadata.matchId': 1 });

// Virtual for match duration
MatchSchema.virtual('duration').get(function() {
  if (this.schedule.actualStart && this.schedule.actualEnd) {
    return this.schedule.actualEnd.getTime() - this.schedule.actualStart.getTime();
  }
  return null;
});

// Virtual for isLive
MatchSchema.virtual('isLive').get(function() {
  return [MatchStatus.IN_PROGRESS, MatchStatus.WARMUP, MatchStatus.SET_BREAK].includes(this.status);
});

// Virtual for isCompleted
MatchSchema.virtual('isCompleted').get(function() {
  return this.status === MatchStatus.COMPLETED || this.status === MatchStatus.ARCHIVED;
});

// Virtual for winner
MatchSchema.virtual('winner').get(function() {
  if (!this.isCompleted) return null;
  return this.homeTeam.stats.setsWon > this.awayTeam.stats.setsWon ? 'home' : 'away';
});

// Virtual for setsPlayed
MatchSchema.virtual('setsPlayed').get(function() {
  return this.sets.filter(s => s.status === SetStatus.COMPLETED).length;
});