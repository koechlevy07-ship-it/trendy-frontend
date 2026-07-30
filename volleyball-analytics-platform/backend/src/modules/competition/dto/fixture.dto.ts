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
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FixtureStatus, FixtureGenerationMethod } from '../schemas/fixture.schema';

export class FixtureVenueDTO {
  @ApiProperty()
  @IsUUID()
  facilityId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  courtId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredStartTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  backupVenueId?: string;
}

export class FixtureSchedulingConstraintsDTO {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredDays?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedDates?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  timeSlotConstraints?: {
    earliestStart: string;
    latestEnd: string;
    minRestHours: number;
    maxConsecutiveDays: number;
  };

  @ApiPropertyOptional({ default: 24 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(168)
  minRestHours?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  avoidBackToBack?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  balanceHomeAway?: boolean;
}

export class FixtureBroadcastDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  streamUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  broadcastChannels?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  streamingPlatform?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentaryLanguage?: string;
}

export class CreateFixtureDTO {
  @ApiProperty()
  @IsUUID()
  competitionId: string;

  @ApiProperty()
  @IsUUID()
  seasonId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  stageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiProperty()
  @IsString()
  round: string;

  @ApiProperty({ minimum: 1, default: 1 })
  @IsNumber()
  @Min(1)
  roundNumber: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  matchNumber?: string;

  @ApiProperty()
  @IsUUID()
  homeTeamId: string;

  @ApiProperty()
  @IsUUID()
  awayTeamId: string;

  @ApiProperty({ type: FixtureVenueDTO })
  @ValidateNested()
  @Type(() => FixtureVenueDTO)
  venue: FixtureVenueDTO;

  @ApiProperty()
  @IsDateString()
  @Type(() => Date)
  scheduledDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  actualStartTime?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  actualEndTime?: Date;

  @ApiProperty({ enum: FixtureStatus, default: FixtureStatus.DRAFT })
  @IsEnum(FixtureStatus)
  status: FixtureStatus;

  @ApiProperty({ enum: FixtureGenerationMethod, default: FixtureGenerationMethod.MANUAL })
  @IsEnum(FixtureGenerationMethod)
  generationMethod: FixtureGenerationMethod;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  assignedOfficials: string[];

  @ApiProperty({ type: FixtureSchedulingConstraintsDTO })
  @ValidateNested()
  @Type(() => FixtureSchedulingConstraintsDTO)
  schedulingConstraints: FixtureSchedulingConstraintsDTO;

  @ApiPropertyOptional({ type: FixtureBroadcastDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => FixtureBroadcastDTO)
  broadcast?: FixtureBroadcastDTO;
}

export class UpdateFixtureDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  round?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  roundNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  matchNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  homeTeamId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  awayTeamId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  scheduledDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  actualStartTime?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  actualEndTime?: Date;

  @ApiPropertyOptional({ enum: FixtureStatus })
  @IsOptional()
  @IsEnum(FixtureStatus)
  status?: FixtureStatus;

  @ApiPropertyOptional({ type: FixtureVenueDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => FixtureVenueDTO)
  venue?: FixtureVenueDTO;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assignedOfficials?: string[];

  @ApiPropertyOptional({ type: FixtureSchedulingConstraintsDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => FixtureSchedulingConstraintsDTO)
  schedulingConstraints?: FixtureSchedulingConstraintsDTO;

  @ApiPropertyOptional({ type: FixtureBroadcastDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => FixtureBroadcastDTO)
  broadcast?: FixtureBroadcastDTO;
}

export class FixtureStatusUpdateDTO {
  @ApiProperty({ enum: FixtureStatus })
  @IsEnum(FixtureStatus)
  status: FixtureStatus;
}

export class FixtureSearchDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  competitionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  stageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  homeTeamId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  awayTeamId?: string;

  @ApiPropertyOptional({ enum: FixtureStatus })
  @IsOptional()
  @IsEnum(FixtureStatus)
  status?: FixtureStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  dateTo?: Date;

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

export class FixtureResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fixtureId: string;

  @ApiProperty()
  competitionId: string;

  @ApiProperty()
  seasonId: string;

  @ApiPropertyOptional()
  stageId?: string;

  @ApiPropertyOptional()
  groupId?: string;

  @ApiProperty()
  round: string;

  @ApiProperty()
  roundNumber: number;

  @ApiPropertyOptional()
  matchNumber?: string;

  @ApiProperty()
  homeTeamId: string;

  @ApiProperty()
  awayTeamId: string;

  @ApiProperty()
  venue: FixtureVenueDTO;

  @ApiProperty()
  scheduledDate: Date;

  @ApiPropertyOptional()
  actualStartTime?: Date;

  @ApiPropertyOptional()
  actualEndTime?: Date;

  @ApiProperty({ enum: FixtureStatus })
  status: FixtureStatus;

  @ApiProperty({ enum: FixtureGenerationMethod })
  generationMethod: FixtureGenerationMethod;

  @ApiProperty()
  assignedOfficials: string[];

  @ApiProperty({ type: FixtureSchedulingConstraintsDTO })
  schedulingConstraints: FixtureSchedulingConstraintsDTO;

  @ApiPropertyOptional()
  broadcast?: FixtureBroadcastDTO;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FixtureSummaryDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fixtureId: string;

  @ApiProperty()
  round: string;

  @ApiProperty()
  homeTeam: { id: string; name: string; shortName: string; code: string };

  @ApiProperty()
  awayTeam: { id: string; name: string; shortName: string; code: string };

  @ApiProperty()
  venue: { id: string; name: string };

  @ApiProperty()
  schedule: { scheduledStart: Date; actualStart?: Date; actualEnd?: Date };

  @ApiProperty({ enum: FixtureStatus })
  status: FixtureStatus;

  @ApiProperty()
  isLive: boolean;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  isUpcoming: boolean;
}