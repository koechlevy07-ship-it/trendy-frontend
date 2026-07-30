import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
  Max,
  Length,
  IsMongoId,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MatchStatus,
  MatchType,
  SetStatus,
  MatchEventType,
  VideoSyncStatus,
} from '../schemas/match.schema';

export class CreateMatchDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  matchCode: string;

  @ApiProperty({ enum: MatchType })
  @IsEnum(MatchType)
  type: MatchType;

  @ApiProperty()
  @IsNumber()
  @IsInt()
  @Min(1)
  round: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @ApiProperty()
  @IsMongoId()
  competitionId: string;

  @ApiProperty()
  @IsMongoId()
  seasonId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  phaseId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  groupId?: string;

  @ApiProperty()
  @IsMongoId()
  homeTeamId: string;

  @ApiProperty()
  @IsMongoId()
  awayTeamId: string;

  @ApiProperty()
  @IsMongoId()
  venueId: string;

  @ApiProperty()
  @IsDateString()
  @Type(() => Date)
  scheduledStart: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  estimatedEndDate?: Date;

  @ApiProperty({ type: () => OfficialAssignmentDTO })
  @ValidateNested()
  @Type(() => OfficialAssignmentDTO)
  firstReferee: OfficialAssignmentDTO;

  @ApiProperty({ required: false, type: () => OfficialAssignmentDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficialAssignmentDTO)
  secondReferee?: OfficialAssignmentDTO;

  @ApiProperty({ type: [OfficialAssignmentDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfficialAssignmentDTO)
  lineJudges: OfficialAssignmentDTO[];

  @ApiProperty({ required: false, type: () => OfficialAssignmentDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficialAssignmentDTO)
  scorer?: OfficialAssignmentDTO;

  @ApiProperty({ required: false, type: () => OfficialAssignmentDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficialAssignmentDTO)
  assistantScorer?: OfficialAssignmentDTO;

  @ApiProperty({ required: false, type: () => OfficialAssignmentDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficialAssignmentDTO)
  courtManager?: OfficialAssignmentDTO;

  @ApiProperty({ type: () => CourtConfigurationDTO })
  @ValidateNested()
  @Type(() => CourtConfigurationDTO)
  courtConfiguration: CourtConfigurationDTO;

  @ApiProperty({ required: false, type: () => AIMetadataDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIMetadataDTO)
  aiMetadata?: AIMetadataDTO;
}

export class UpdateMatchDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @ApiProperty({ required: false, enum: MatchStatus })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  scheduledStart?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  estimatedEndDate?: Date;

  @ApiProperty({ required: false, type: () => OfficialAssignmentDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficialAssignmentDTO)
  firstReferee?: OfficialAssignmentDTO;

  @ApiProperty({ required: false, type: () => OfficialAssignmentDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficialAssignmentDTO)
  secondReferee?: OfficialAssignmentDTO;

  @ApiProperty({ required: false, type: [OfficialAssignmentDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfficialAssignmentDTO)
  lineJudges?: OfficialAssignmentDTO[];

  @ApiProperty({ required: false, type: () => OfficialAssignmentDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficialAssignmentDTO)
  scorer?: OfficialAssignmentDTO;

  @ApiProperty({ required: false, type: () => OfficialAssignmentDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficialAssignmentDTO)
  assistantScorer?: OfficialAssignmentDTO;

  @ApiProperty({ required: false, type: () => OfficialAssignmentDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficialAssignmentDTO)
  courtManager?: OfficialAssignmentDTO;

  @ApiProperty({ required: false, type: () => CourtConfigurationDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtConfigurationDTO)
  courtConfiguration?: CourtConfigurationDTO;
}

export class MatchStatusUpdateDTO {
  @ApiProperty({ enum: MatchStatus })
  @IsEnum(MatchStatus)
  status: MatchStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  statusChangeReason?: string;
}

export class OfficialAssignmentDTO {
  @ApiProperty()
  @IsMongoId()
  officialId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  federation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificationLevel?: string;
}

export class CourtConfigurationDTO {
  @ApiProperty()
  @IsString()
  surface: string;

  @ApiProperty()
  @IsString()
  dimensions: string;

  @ApiProperty({ type: [CameraPositionDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CameraPositionDTO)
  cameraPositions: CameraPositionDTO[];

  @ApiProperty({ required: false, type: () => LightingConfigDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => LightingConfigDTO)
  lighting?: LightingConfigDTO;
}

export class CameraPositionDTO {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  @IsNumber({}, { each: true })
  @Length(3, 3)
  position: number[];

  @ApiProperty()
  @IsArray()
  @IsNumber({}, { each: true })
  @Length(3, 3)
  rotation: number[];

  @ApiProperty({ required: false, type: () => CameraConfigDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CameraConfigDTO)
  config?: CameraConfigDTO;
}

export class CameraConfigDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Int()
  @Min(1)
  @Max(120)
  fps?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  encoding?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoFocus?: boolean;
}

export class LightingConfigDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lux?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temperature?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  zones: string[];
}

export class MatchEventDTO {
  @ApiProperty({ enum: MatchEventType })
  @IsEnum(MatchEventType)
  type: MatchEventType;

  @ApiProperty()
  @IsMongoId()
  teamId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  playerId?: string;

  @ApiProperty()
  @IsNumber()
  @Int()
  @Min(1)
  setNumber: number;

  @ApiProperty()
  @IsNumber()
  @Int()
  @Min(0)
  timestamp: number;

  @ApiProperty()
  @IsNumber()
  @Int()
  @Min(0)
  homeScore: number;

  @ApiProperty()
  @IsNumber()
  @Int()
  @Min(0)
  awayScore: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isChallenge?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  challengeResult?: string;
}

export class SetResultDTO {
  @ApiProperty()
  @IsNumber()
  @Int()
  @Min(1)
  @Max(7)
  setNumber: number;

  @ApiProperty()
  @IsNumber()
  @Int()
  @Min(0)
  homeScore: number;

  @ApiProperty()
  @IsNumber()
  @Int()
  @Min(0)
  awayScore: number;

  @ApiProperty()
  @IsNumber()
  @Int()
  @Min(0)
  durationMinutes: number;

  @ApiProperty()
  @IsDateString()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty()
  @IsDateString()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ enum: SetStatus })
  @IsEnum(SetStatus)
  status: SetStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['home', 'away'])
  winningTeamSide?: 'home' | 'away';

  @ApiProperty({ required: false, type: () => SetStatsDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => SetStatsDTO)
  stats?: SetStatsDTO;
}

export class SetStatsDTO {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalPoints: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalRallies: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  averageRallyLength: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  longestRally: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  homeAttacks: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  awayAttacks: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  homeBlocks: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  awayBlocks: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  homeServes: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  awayServes: number;
}

export class AIMetadataDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  matchId?: string;

  @ApiProperty({ required: false, type: () => VideoSyncInfoDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => VideoSyncInfoDTO)
  videoSync?: VideoSyncInfoDTO;

  @ApiProperty({ type: [StreamConfigDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StreamConfigDTO)
  streams: StreamConfigDTO[];

  @ApiProperty({ required: false, type: () => AIConfigDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIConfigDTO)
  config?: AIConfigDTO;

  @ApiProperty({ required: false, type: () => AnalyticsConfigDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => AnalyticsConfigDTO)
  analytics?: AnalyticsConfigDTO;
}

export class VideoSyncInfoDTO {
  @ApiProperty({ enum: VideoSyncStatus })
  @IsEnum(VideoSyncStatus)
  status: VideoSyncStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  syncedAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Int()
  offsetMs?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  syncMethod?: string;
}

export class StreamConfigDTO {
  @ApiProperty()
  @IsString()
  streamId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  protocol: string;

  @ApiProperty()
  @IsString()
  resolution: string;

  @ApiProperty()
  @IsNumber()
  @Int()
  @Min(1)
  @Max(120)
  fps: number;

  @ApiProperty()
  @IsNumber()
  @Int()
  @Min(500)
  @Max(50000)
  bitrate: number;

  @ApiProperty()
  @IsBoolean()
  isPrimary: boolean;
}

export class AIConfigDTO {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  enabledModules: string[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceThreshold: number;

  @ApiProperty()
  @IsBoolean()
  realTimeProcessing: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  customConfig?: Record<string, any>;
}

export class AnalyticsConfigDTO {
  @ApiProperty()
  @IsBoolean()
  generateHeatmaps: boolean;

  @ApiProperty()
  @IsBoolean()
  generateShotCharts: boolean;

  @ApiProperty()
  @IsBoolean()
  generatePerformanceMetrics: boolean;

  @ApiProperty()
  @IsBoolean()
  trackMomentum: boolean;

  @ApiProperty()
  @IsBoolean()
  detectPatterns: boolean;
}

export class MatchSearchDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ enum: MatchStatus, required: false })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiProperty({ enum: MatchType, required: false })
  @IsOptional()
  @IsEnum(MatchType)
  type?: MatchType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  competitionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  seasonId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  teamId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  venueId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  dateFrom?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  dateTo?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  perPage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class MatchResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  matchId: string;

  @ApiProperty()
  matchCode: string;

  @ApiProperty()
  type: MatchType;

  @ApiProperty()
  round: number;

  @ApiProperty()
  displayName?: string;

  @ApiProperty()
  competitionId: string;

  @ApiProperty()
  seasonId: string;

  @ApiProperty()
  homeTeam: TeamAssignmentResponseDTO;

  @ApiProperty()
  awayTeam: TeamAssignmentResponseDTO;

  @ApiProperty()
  venue: VenueResponseDTO;

  @ApiProperty()
  officials: OfficialsResponseDTO;

  @ApiProperty()
  schedule: ScheduleResponseDTO;

  @ApiProperty({ enum: MatchStatus })
  status: MatchStatus;

  @ApiProperty()
  sets: SetResultDTO[];

  @ApiProperty()
  aiMetadata: AIMetadataDTO;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MatchSummaryDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  matchId: string;

  @ApiProperty()
  matchCode: string;

  @ApiProperty()
  type: MatchType;

  @ApiProperty()
  round: number;

  @ApiProperty()
  homeTeam: { id: string; name: string; shortName: string; code: string };

  @ApiProperty()
  awayTeam: { id: string; name: string; shortName: string; code: string };

  @ApiProperty()
  venue: { id: string; name: string };

  @ApiProperty()
  schedule: { scheduledStart: Date; actualStart?: Date; actualEnd?: Date };

  @ApiProperty({ enum: MatchStatus })
  status: MatchStatus;

  @ApiProperty()
  homeSetScore: number;

  @ApiProperty()
  awaySetScore: number;

  @ApiProperty()
  currentSet: number;

  @ApiProperty()
  isLive: boolean;

  @ApiProperty()
  winner?: 'home' | 'away';
}

export class TeamAssignmentResponseDTO {
  @ApiProperty()
  teamId: string;

  @ApiProperty()
  teamName: string;

  @ApiProperty()
  shortName: string;

  @ApiProperty()
  teamCode: string;

  @ApiProperty()
  side: 'home' | 'away';

  @ApiProperty()
  logoUrl?: string;

  @ApiProperty()
  stats: TeamMatchStatsResponseDTO;

  @ApiProperty()
  lineup: TeamLineupResponseDTO;
}

export class TeamMatchStatsResponseDTO {
  @ApiProperty()
  setsWon: number;

  @ApiProperty()
  setsLost: number;

  @ApiProperty()
  pointsWon: number;

  @ApiProperty()
  pointsLost: number;

  @ApiProperty()
  setScores: number[];

  @ApiProperty()
  detailedStats?: DetailedTeamStatsResponseDTO;
}

export class DetailedTeamStatsResponseDTO {
  @ApiProperty()
  attacks: number;

  @ApiProperty()
  attackPoints: number;

  @ApiProperty()
  attackErrors: number;

  @ApiProperty()
  blocks: number;

  @ApiProperty()
  blockPoints: number;

  @ApiProperty()
  blockErrors: number;

  @ApiProperty()
  serves: number;

  @ApiProperty()
  aces: number;

  @ApiProperty()
  serveErrors: number;

  @ApiProperty()
  receptions: number;

  @ApiProperty()
  perfectReceptions: number;

  @ApiProperty()
  receptionErrors: number;

  @ApiProperty()
  digs: number;

  @ApiProperty()
  excellentDigs: number;

  @ApiProperty()
  sets: number;

  @ApiProperty()
  perfectSets: number;

  @ApiProperty()
  setErrors: number;
}

export class TeamLineupResponseDTO {
  @ApiProperty({ type: [PlayerAssignmentResponseDTO] })
  starters: PlayerAssignmentResponseDTO[];

  @ApiProperty({ type: [PlayerAssignmentResponseDTO] })
  substitutes: PlayerAssignmentResponseDTO[];

  @ApiProperty({ required: false })
  captainId?: string;

  @ApiProperty({ required: false })
  liberoId?: string;

  @ApiProperty({ required: false })
  coachId?: string;
}

export class PlayerAssignmentResponseDTO {
  @ApiProperty()
  playerId: string;

  @ApiProperty()
  jerseyNumber: number;

  @ApiProperty()
  position: string;

  @ApiProperty()
  isCaptain: boolean;

  @ApiProperty()
  isLibero: boolean;

  @ApiProperty()
  stats?: PlayerMatchStatsResponseDTO;
}

export class PlayerMatchStatsResponseDTO {
  @ApiProperty()
  points: number;

  @ApiProperty()
  attacks: number;

  @ApiProperty()
  blocks: number;

  @ApiProperty()
  serves: number;

  @ApiProperty()
  receptions: number;

  @ApiProperty()
  digs: number;

  @ApiProperty()
  sets: number;

  @ApiProperty()
  errors: number;
}

export class VenueResponseDTO {
  @ApiProperty()
  facilityId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  courtName?: string;

  @ApiProperty()
  configuration: CourtConfigurationResponseDTO;
}

export class CourtConfigurationResponseDTO {
  @ApiProperty()
  surface: string;

  @ApiProperty()
  dimensions: string;

  @ApiProperty({ type: [CameraPositionResponseDTO] })
  cameraPositions: CameraPositionResponseDTO[];

  @ApiProperty({ required: false })
  lighting?: LightingConfigResponseDTO;
}

export class CameraPositionResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  position: number[];

  @ApiProperty()
  rotation: number[];

  @ApiProperty({ required: false })
  config?: CameraConfigResponseDTO;
}

export class CameraConfigResponseDTO {
  @ApiProperty({ required: false })
  model?: string;

  @ApiProperty({ required: false })
  fps?: number;

  @ApiProperty({ required: false })
  resolution?: string;

  @ApiProperty({ required: false })
  encoding?: string;

  @ApiProperty({ required: false })
  autoFocus?: boolean;
}

export class LightingConfigResponseDTO {
  @ApiProperty({ required: false })
  lux?: number;

  @ApiProperty({ required: false })
  temperature?: string;

  @ApiProperty()
  zones: string[];
}

export class OfficialsResponseDTO {
  @ApiProperty({ required: false })
  firstReferee?: OfficialAssignmentResponseDTO;

  @ApiProperty({ required: false })
  secondReferee?: OfficialAssignmentResponseDTO;

  @ApiProperty({ required: false })
  challengeReferee?: OfficialAssignmentResponseDTO;

  @ApiProperty({ type: [OfficialAssignmentResponseDTO] })
  lineJudges: OfficialAssignmentResponseDTO[];

  @ApiProperty({ required: false })
  scorer?: OfficialAssignmentResponseDTO;

  @ApiProperty({ required: false })
  assistantScorer?: OfficialAssignmentResponseDTO;

  @ApiProperty({ required: false })
  courtManager?: OfficialAssignmentResponseDTO;
}

export class OfficialAssignmentResponseDTO {
  @ApiProperty()
  officialId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  federation?: string;

  @ApiProperty({ required: false })
  certificationLevel?: string;
}

export class ScheduleResponseDTO {
  @ApiProperty()
  scheduledStart: Date;

  @ApiProperty({ required: false })
  estimatedEndDate?: Date;

  @ApiProperty({ required: false })
  actualStart?: Date;

  @ApiProperty({ required: false })
  actualEnd?: Date;

  @ApiProperty({ required: false })
  durationMinutes?: number;

  @ApiProperty({ type: [Date] })
  setStartTimes: Date[];

  @ApiProperty({ type: [Date] })
  setEndTimes: Date[];

  @ApiProperty({ required: false })
  timeZone?: string;
}