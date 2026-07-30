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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CompetitionType,
  CompetitionFormat,
  CompetitionStatus,
  ScoringSystem,
} from '../schemas/competition.schema';

export class CompetitionRulesDTO {
  @ApiProperty({ enum: ScoringSystem })
  @IsEnum(ScoringSystem)
  scoringSystem: ScoringSystem;

  @ApiProperty({ minimum: 15, maximum: 50, default: 25 })
  @IsNumber()
  @Min(15)
  @Max(50)
  pointsPerSet: number;

  @ApiProperty({ minimum: 8, maximum: 25, default: 15 })
  @IsNumber()
  @Min(8)
  @Max(25)
  decidingSetPoints: number;

  @ApiProperty({ minimum: 1, maximum: 5, default: 2 })
  @IsNumber()
  @Min(1)
  @Max(5)
  minPointsDifference: number;

  @ApiProperty({ minimum: 2, maximum: 7, default: 3 })
  @IsNumber()
  @Min(2)
  @Max(7)
  maxSets: number;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  liberoAllowed?: boolean;

  @ApiProperty({ minimum: 0, maximum: 5, default: 2 })
  @IsNumber()
  @Min(0)
  @Max(5)
  technicalTimeouts: number;

  @ApiProperty({ minimum: 0, maximum: 5, default: 2 })
  @IsNumber()
  @Min(0)
  @Max(5)
  teamTimeoutsPerSet: number;

  @ApiProperty({ minimum: 15, maximum: 120, default: 30 })
  @IsNumber()
  @Min(15)
  @Max(120)
  timeoutDuration: number;

  @ApiProperty({ minimum: 30, maximum: 180, default: 60 })
  @IsNumber()
  @Min(30)
  @Max(180)
  intervalDuration: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customRules?: string;
}

export class CompetitionScheduleDTO {
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
  schedulePublishedDate?: Date;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  matchDays?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedDates?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  timeSlotConstraints?: {
    earliestStart: string;
    latestEnd: string;
    minRestHours: number;
  };
}

export class CompetitionPrizeDTO {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  position: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sponsor?: string;
}

export class CreateCompetitionDTO {
  @ApiProperty({ minLength: 3, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @ApiProperty({ minLength: 2, maxLength: 10 })
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  shortName: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ enum: CompetitionType })
  @IsEnum(CompetitionType)
  type: CompetitionType;

  @ApiProperty({ enum: CompetitionFormat })
  @IsEnum(CompetitionFormat)
  format: CompetitionFormat;

  @ApiProperty()
  @IsUUID()
  seasonId: string;

  @ApiProperty()
  @IsUUID()
  organizerId: string;

  @ApiProperty({ type: CompetitionRulesDTO })
  @ValidateNested()
  @Type(() => CompetitionRulesDTO)
  rules: CompetitionRulesDTO;

  @ApiProperty({ type: CompetitionScheduleDTO })
  @ValidateNested()
  @Type(() => CompetitionScheduleDTO)
  schedule: CompetitionScheduleDTO;

  @ApiProperty({ minimum: 2, maximum: 128, default: 12 })
  @IsNumber()
  @Min(2)
  @Max(128)
  maxParticipants: number;

  @ApiPropertyOptional({ type: [CompetitionPrizeDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetitionPrizeDTO)
  prizes?: CompetitionPrizeDTO[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateCompetitionDTO {
  @ApiPropertyOptional({ minLength: 3, maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @ApiPropertyOptional({ minLength: 2, maxLength: 10 })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  shortName?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ enum: CompetitionFormat })
  @IsOptional()
  @IsEnum(CompetitionFormat)
  format?: CompetitionFormat;

  @ApiPropertyOptional({ enum: CompetitionStatus })
  @IsOptional()
  @IsEnum(CompetitionStatus)
  status?: CompetitionStatus;

  @ApiPropertyOptional({ type: CompetitionRulesDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompetitionRulesDTO)
  rules?: CompetitionRulesDTO;

  @ApiPropertyOptional({ type: CompetitionScheduleDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompetitionScheduleDTO)
  schedule?: CompetitionScheduleDTO;

  @ApiPropertyOptional({ minimum: 2, maximum: 128 })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(128)
  maxParticipants?: number;

  @ApiPropertyOptional({ type: [CompetitionPrizeDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetitionPrizeDTO)
  prizes?: CompetitionPrizeDTO[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CompetitionSearchDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: CompetitionType })
  @IsOptional()
  @IsEnum(CompetitionType)
  type?: CompetitionType;

  @ApiPropertyOptional({ enum: CompetitionFormat })
  @IsOptional()
  @IsEnum(CompetitionFormat)
  format?: CompetitionFormat;

  @ApiPropertyOptional({ enum: CompetitionStatus })
  @IsOptional()
  @IsEnum(CompetitionStatus)
  status?: CompetitionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  seasonId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  organizerId?: string;

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

export class CompetitionResponseDTO {
  @ApiProperty()
  competitionId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ enum: CompetitionType })
  type: CompetitionType;

  @ApiProperty({ enum: CompetitionFormat })
  format: CompetitionFormat;

  @ApiProperty({ enum: CompetitionStatus })
  status: CompetitionStatus;

  @ApiProperty()
  seasonId: string;

  @ApiProperty()
  organizerId: string;

  @ApiProperty({ type: CompetitionRulesDTO })
  rules: CompetitionRulesDTO;

  @ApiProperty({ type: CompetitionScheduleDTO })
  schedule: CompetitionScheduleDTO;

  @ApiProperty()
  participantIds: string[];

  @ApiProperty()
  maxParticipants: number;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  completedMatches: number;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CompetitionSummaryDTO {
  @ApiProperty()
  competitionId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;

  @ApiProperty({ enum: CompetitionType })
  type: CompetitionType;

  @ApiProperty({ enum: CompetitionFormat })
  format: CompetitionFormat;

  @ApiProperty({ enum: CompetitionStatus })
  status: CompetitionStatus;

  @ApiProperty()
  seasonId: string;

  @ApiProperty({ type: CompetitionScheduleDTO })
  schedule: CompetitionScheduleDTO;

  @ApiProperty()
  participantCount: number;

  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  completedMatches: number;

  @ApiProperty()
  progress: number;
}