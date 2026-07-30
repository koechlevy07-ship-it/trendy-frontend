import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUUID,
  Min,
  Max,
  Length,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StandingType } from '../schemas/standings.schema';

export class StandingEntryDTO {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  position: number;

  @ApiProperty()
  @IsUUID()
  teamId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  teamName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  teamShortName: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  matchesPlayed: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  wins: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  losses: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  draws: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  points: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  setsWon: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  setsLost: number;

  @ApiProperty()
  @IsNumber()
  setRatio: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  pointsFor: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  pointsAgainst: number;

  @ApiProperty()
  @IsNumber()
  pointRatio: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(10)
  form: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  recentResults: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  homeWins: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  homeLosses: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  awayWins: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  awayLosses: number;
}

export class TiebreakRuleDTO {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  priority: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  criteria: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  direction: 'desc' | 'asc';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateStandingsDTO {
  @ApiProperty()
  @IsUUID()
  competitionId: string;

  @ApiProperty()
  @IsUUID()
  seasonId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  phaseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiProperty({ enum: StandingType })
  @IsEnum(StandingType)
  type: StandingType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [StandingEntryDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StandingEntryDTO)
  entries: StandingEntryDTO[];

  @ApiProperty({ type: [TiebreakRuleDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TiebreakRuleDTO)
  tiebreakRules: TiebreakRuleDTO[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;
}

export class UpdateStandingsDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ type: [StandingEntryDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StandingEntryDTO)
  entries?: StandingEntryDTO[];

  @ApiPropertyOptional({ type: [TiebreakRuleDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TiebreakRuleDTO)
  tiebreakRules?: TiebreakRuleDTO[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;
}

export class StandingsSearchDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  competitionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  seasonId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  phaseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ enum: StandingType })
  @IsOptional()
  @IsEnum(StandingType)
  type?: StandingType;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  perPage?: number;
}

export class StandingsResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  standingsId: string;

  @ApiProperty()
  competitionId: string;

  @ApiProperty()
  seasonId: string;

  @ApiPropertyOptional()
  phaseId?: string;

  @ApiPropertyOptional()
  groupId?: string;

  @ApiProperty({ enum: StandingType })
  type: StandingType;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [StandingEntryDTO] })
  entries: StandingEntryDTO[];

  @ApiProperty({ type: [TiebreakRuleDTO] })
  tiebreakRules: TiebreakRuleDTO[];

  @ApiProperty()
  isFinal: boolean;

  @ApiPropertyOptional()
  lastUpdated?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class StandingsSummaryDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  standingsId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: StandingType })
  type: StandingType;

  @ApiProperty()
  isFinal: boolean;

  @ApiProperty()
  topTeams: StandingEntryDTO[];

  @ApiProperty()
  bottomTeams: StandingEntryDTO[];

  @ApiProperty()
  qualifiedTeams: StandingEntryDTO[];

  @ApiProperty()
  eliminatedTeams: StandingEntryDTO[];

  @ApiPropertyOptional()
  lastUpdated?: Date;
}