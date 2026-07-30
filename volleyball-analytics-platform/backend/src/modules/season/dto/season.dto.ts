import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUUID,
  Min,
  Max,
  Length,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeasonStatus } from '../schemas/season.schema';

export class CreateSeasonDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  code: string;

  @ApiProperty()
  @IsNumber()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: SeasonStatus, default: SeasonStatus.UPCOMING })
  @IsEnum(SeasonStatus)
  status: SeasonStatus;

  @ApiProperty({ type: SeasonRulesDTO })
  @ValidateNested()
  @Type(() => SeasonRulesDTO)
  rules: SeasonRulesDTO;

  @ApiProperty({ type: SeasonScheduleDTO })
  @ValidateNested()
  @Type(() => SeasonScheduleDTO)
  schedule: SeasonScheduleDTO;

  @ApiPropertyOptional({ type: SeasonMetadataDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeasonMetadataDTO)
  metadata?: SeasonMetadataDTO;
}

export class UpdateSeasonDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: SeasonStatus })
  @IsOptional()
  @IsEnum(SeasonStatus)
  status?: SeasonStatus;

  @ApiPropertyOptional({ type: SeasonRulesDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeasonRulesDTO)
  rules?: SeasonRulesDTO;

  @ApiPropertyOptional({ type: SeasonScheduleDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeasonScheduleDTO)
  schedule?: SeasonScheduleDTO;

  @ApiPropertyOptional({ type: SeasonMetadataDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeasonMetadataDTO)
  metadata?: SeasonMetadataDTO;
}

export class SeasonRulesDTO {
  @ApiProperty({ minimum: 2, maximum: 50, default: 12 })
  @IsNumber()
  @Min(2)
  @Max(50)
  minTeamsPerCompetition: number;

  @ApiProperty({ minimum: 2, maximum: 100, default: 24 })
  @IsNumber()
  @Min(2)
  @Max(100)
  maxTeamsPerCompetition: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowTransfers?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  transferWindowStart?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  transferWindowEnd?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customRules?: string;
}

export class SeasonScheduleDTO {
  @ApiProperty()
  @IsDateString()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  registrationOpenDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  registrationCloseDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  fixturesPublishedDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  midSeasonBreakStart?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  midSeasonBreakEnd?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  playoffsStartDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  finalsStartDate?: Date;
}

export class SeasonMetadataDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sponsors?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  officialWebsite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  streamingPlatform?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  broadcastPartners?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class SeasonSearchDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: SeasonStatus })
  @IsOptional()
  @IsEnum(SeasonStatus)
  status?: SeasonStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(2000)
  @Max(2100)
  year?: number;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class SeasonResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  seasonId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  year: number;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: SeasonStatus })
  status: SeasonStatus;

  @ApiProperty({ type: SeasonRulesDTO })
  rules: SeasonRulesDTO;

  @ApiProperty({ type: SeasonScheduleDTO })
  schedule: SeasonScheduleDTO;

  @ApiProperty()
  competitionIds: string[];

  @ApiProperty({ type: SeasonStatisticsResponseDTO })
  statistics: SeasonStatisticsResponseDTO;

  @ApiProperty({ type: SeasonMetadataDTO })
  metadata: SeasonMetadataDTO;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SeasonSummaryDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  seasonId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  year: number;

  @ApiProperty({ enum: SeasonStatus })
  status: SeasonStatus;

  @ApiProperty({ type: SeasonScheduleDTO })
  schedule: SeasonScheduleDTO;

  @ApiProperty()
  competitionCount: number;

  @ApiProperty()
  durationDays: number;
}

export class SeasonStatisticsResponseDTO {
  @ApiProperty()
  totalCompetitions: number;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  totalTeams: number;

  @ApiProperty()
  totalPlayers: number;

  @ApiProperty()
  totalGoals: number;

  @ApiProperty()
  averageAttendance: number;
}