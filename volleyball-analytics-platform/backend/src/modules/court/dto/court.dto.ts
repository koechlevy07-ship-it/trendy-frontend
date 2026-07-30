import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
  IsObject,
  IsBoolean,
  Min,
  Max,
  Length,
  IsUUID,
  IsUrl,
  IsEmail,
  IsBoolean,
  IsArray,
  IsString,
  ValidateNested,
  Type,
  IsArray,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CourtType,
  CourtSurface,
  CourtOrientation,
  CourtStatus,
  NetType,
  CourtSide,
  SafetyZoneType,
} from '../schemas/court.schema';

// ============================================================================
// SUB-DTOs
// ============================================================================

export class CourtIdentityDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  courtId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  shortName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  displayName: string;

  @ApiProperty({ enum: CourtType })
  @IsEnum(CourtType)
  type: CourtType;

  @ApiPropertyOptional({ enum: CourtStatus, default: CourtStatus.DRAFT })
  @IsOptional()
  @IsEnum(CourtStatus)
  status?: CourtStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}

export class CourtVenueReferenceDTO {
  @ApiProperty()
  @IsUUID()
  venueId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  venueName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  venueCode?: string;
}

export class CourtDimensionsDTO {
  @ApiProperty()
  @IsNumber()
  @Min(10)
  @Max(30)
  length: number;

  @ApiProperty()
  @IsNumber()
  @Min(5)
  @Max(20)
  width: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeZoneWidth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeZoneLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeHeight?: number;

  @ApiProperty({ enum: CourtOrientation })
  @IsEnum(CourtOrientation)
  orientation: CourtOrientation;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasRaisedPlatform?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  platformHeight?: number;
}

export class CourtSurfaceDTO {
  @ApiProperty({ enum: CourtSurface })
  @IsEnum(CourtSurface)
  surfaceType: CourtSurface;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  surfaceMaterial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  surfaceColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  surfaceBrand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  installedDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 200)
  maintenanceSchedule?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  lastMaintenanceDate?: Date;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  shockAbsorption?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  verticalDeformation?: number;
}

export class CourtMarkingsDTO {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  boundaryLines?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  attackLines?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  centerLine?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  serviceZones?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  substitutionZones?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  liberoReplacementZone?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  coachRestrictionLine?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  lineColor?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 10, default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  lineWidth?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  lineMaterial?: string;
}

export class SafetyZoneDTO {
  @ApiProperty({ enum: SafetyZoneType })
  @IsEnum(SafetyZoneType)
  type: SafetyZoneType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(10)
  width: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  length?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  surface?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isObstructed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 200)
  obstructionDetails?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isCompliant?: boolean;
}

export enum SafetyZoneType {
  FREE = 'free',
  OBSTRUCTION = 'obstruction',
  PENALTY = 'penalty',
  SERVICE = 'service',
  END_LINE = 'end_line',
  SIDE_LINE = 'side_line',
  ATTACK_LINE = 'attack_line',
  CENTER_LINE = 'center_line',
}

export class NetConfigurationDTO {
  @ApiProperty({ enum: NetType })
  @IsEnum(NetType)
  type: NetType;

  @ApiProperty()
  @IsNumber()
  @Min(2.0)
  @Max(3.0)
  height: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  netMaterial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  netColor?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  hasAntennae?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  antennaHeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  sideBandsColor?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasSideBands?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  netSystem?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  tensionSystem?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  tensionForce?: number;
}

export enum NetType {
  INDOOR = 'indoor',
  BEACH = 'beach',
  SITTING = 'sitting',
  TRAINING = 'training',
  COMPETITION = 'competition',
}

export class CourtEquipmentDTO {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  hasRefereeStand?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  refereeStandType?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  hasScoreboard?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  scoreboardType?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasVideoReplay?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasChallengeSystem?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  hasTeamBenches?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 20, default: 14 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  benchCapacity?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasWarmupArea?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasMedicalArea?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasEquipmentStorage?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalEquipment?: string[];
}

export class CourtCameraReferenceDTO {
  @ApiProperty()
  @IsUUID()
  cameraId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cameraName: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  lensType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  focalLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  coverageZone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  calibrationProfile?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AICalibrationProfileDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  profileId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledModules?: string[];

  @ApiPropertyOptional({ minimum: 0, maximum: 1, default: 0.8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceThreshold?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  realTimeProcessing?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customConfig?: Record<string, any>;
}

export class CourtAvailabilityDTO {
  @ApiProperty({ enum: ['available', 'booked', 'maintenance', 'blocked', 'reserved'] })
  @IsEnum(['available', 'booked', 'maintenance', 'blocked', 'reserved'])
  status: 'available' | 'booked' | 'maintenance' | 'blocked' | 'reserved';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  availableFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  availableUntil?: Date;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  bookedFixtures?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  bookedMatches?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  recurringSchedule?: Record<string, any>;
}

export class CourtOperationalStatusDTO {
  @ApiProperty({ enum: CourtStatus, default: CourtStatus.DRAFT })
  @IsEnum(CourtStatus)
  status: CourtStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  activatedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  activatedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  lastMaintenanceDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  nextScheduledMaintenance?: Date;
}

export class CourtAuditInfoDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  updatedBy?: string;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @Min(0)
  version: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  auditReference?: string;
}

export class CourtArchiveDTO {
  @ApiProperty({ default: false })
  @IsBoolean()
  isArchived: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  archivedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  archivedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  archiveReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  snapshot?: Record<string, any>;
}

export class CourtAIRecipeDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  recognitionProfileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  preferredCourtTemplate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  jerseyRecognitionTemplate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  logoRecognitionProfile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  courtPreferences?: string;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  courtEmbedding?: number[];
}

// ============================================================================
// MAIN DTOs
// ============================================================================

export class CreateCourtDTO {
  @ApiProperty({ type: CourtIdentityDTO })
  @ValidateNested()
  @Type(() => CourtIdentityDTO)
  identity: CourtIdentityDTO;

  @ApiProperty({ type: CourtVenueReferenceDTO })
  @ValidateNested()
  @Type(() => CourtVenueReferenceDTO)
  venue: CourtVenueReferenceDTO;

  @ApiProperty({ type: CourtDimensionsDTO })
  @ValidateNested()
  @Type(() => CourtDimensionsDTO)
  dimensions: CourtDimensionsDTO;

  @ApiProperty({ type: CourtSurfaceDTO })
  @ValidateNested()
  @Type(() => CourtSurfaceDTO)
  surface: CourtSurfaceDTO;

  @ApiProperty({ type: CourtMarkingsDTO })
  @ValidateNested()
  @Type(() => CourtMarkingsDTO)
  markings: CourtMarkingsDTO;

  @ApiPropertyOptional({ type: [SafetyZoneDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SafetyZoneDTO)
  safetyZones?: SafetyZoneDTO[];

  @ApiProperty({ type: NetConfigurationDTO })
  @ValidateNested()
  @Type(() => NetConfigurationDTO)
  net: NetConfigurationDTO;

  @ApiPropertyOptional({ type: CourtEquipmentDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtEquipmentDTO)
  equipment?: CourtEquipmentDTO;

  @ApiPropertyOptional({ type: [CourtCameraReferenceDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourtCameraReferenceDTO)
  cameraReferences?: CourtCameraReferenceDTO[];

  @ApiPropertyOptional({ type: [AICalibrationProfileDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AICalibrationProfileDTO)
  aiCalibrationProfiles?: AICalibrationProfileDTO[];

  @ApiPropertyOptional({ type: CourtAvailabilityDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtAvailabilityDTO)
  availability?: CourtAvailabilityDTO;

  @ApiPropertyOptional({ type: CourtOperationalStatusDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtOperationalStatusDTO)
  operationalStatus?: CourtOperationalStatusDTO;

  @ApiPropertyOptional({ type: CourtAuditInfoDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtAuditInfoDTO)
  audit?: CourtAuditInfoDTO;

  @ApiPropertyOptional({ type: CourtAIRecipeDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtAIRecipeDTO)
  aiRecipe?: CourtAIRecipeDTO;
}

export class UpdateCourtDTO {
  @ApiPropertyOptional({ type: CourtIdentityDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtIdentityDTO)
  identity?: CourtIdentityDTO;

  @ApiPropertyOptional({ type: CourtDimensionsDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtDimensionsDTO)
  dimensions?: CourtDimensionsDTO;

  @ApiPropertyOptional({ type: CourtSurfaceDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtSurfaceDTO)
  surface?: CourtSurfaceDTO;

  @ApiPropertyOptional({ type: CourtMarkingsDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtMarkingsDTO)
  markings?: CourtMarkingsDTO;

  @ApiPropertyOptional({ type: [SafetyZoneDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SafetyZoneDTO)
  safetyZones?: SafetyZoneDTO[];

  @ApiPropertyOptional({ type: NetConfigurationDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => NetConfigurationDTO)
  net?: NetConfigurationDTO;

  @ApiPropertyOptional({ type: CourtEquipmentDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtEquipmentDTO)
  equipment?: CourtEquipmentDTO;

  @ApiPropertyOptional({ type: CourtOperationalStatusDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtOperationalStatusDTO)
  operationalStatus?: CourtOperationalStatusDTO;

  @ApiPropertyOptional({ type: [CourtCameraReferenceDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourtCameraReferenceDTO)
  cameraReferences?: CourtCameraReferenceDTO[];

  @ApiPropertyOptional({ type: [AICalibrationProfileDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AICalibrationProfileDTO)
  aiCalibrationProfiles?: AICalibrationProfileDTO[];

  @ApiPropertyOptional({ type: CourtAvailabilityDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtAvailabilityDTO)
  availability?: CourtAvailabilityDTO;

  @ApiPropertyOptional({ type: CourtAuditInfoDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourtAuditInfoDTO)
  audit?: CourtAuditInfoDTO;
}

export class CourtSearchDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: CourtType })
  @IsOptional()
  @IsEnum(CourtType)
  type?: CourtType;

  @ApiPropertyOptional({ enum: CourtSurface })
  @IsOptional()
  @IsEnum(CourtSurface)
  surface?: CourtSurface;

  @ApiPropertyOptional({ enum: CourtStatus })
  @IsOptional()
  @IsEnum(CourtStatus)
  status?: CourtStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  venueId?: string;

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

export class CourtResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  courtId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ enum: CourtType })
  type: CourtType;

  @ApiProperty({ enum: CourtSurface })
  surfaceType: CourtSurface;

  @ApiProperty({ enum: CourtStatus })
  status: CourtStatus;

  @ApiProperty()
  venue: CourtVenueReferenceDTO;

  @ApiProperty()
  dimensions: CourtDimensionsDTO;

  @ApiProperty()
  surface: CourtSurfaceDTO;

  @ApiProperty()
  markings: CourtMarkingsDTO;

  @ApiProperty({ type: [SafetyZoneDTO] })
  safetyZones: SafetyZoneDTO[];

  @ApiProperty()
  net: NetConfigurationDTO;

  @ApiProperty()
  equipment: CourtEquipmentDTO;

  @ApiProperty({ type: [CourtCameraReferenceDTO] })
  cameraReferences: CourtCameraReferenceDTO[];

  @ApiProperty({ type: [AICalibrationProfileDTO] })
  aiCalibrationProfiles: AICalibrationProfileDTO[];

  @ApiProperty()
  availability: CourtAvailabilityDTO;

  @ApiProperty()
  operationalStatus: CourtOperationalStatusDTO;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CourtSummaryDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  courtId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;

  @ApiProperty({ enum: CourtType })
  type: CourtType;

  @ApiProperty({ enum: CourtSurface })
  surfaceType: CourtSurface;

  @ApiProperty({ enum: CourtStatus })
  status: CourtStatus;

  @ApiProperty()
  venue: { id: string; name: string };

  @ApiProperty()
  dimensions: { length: number; width: number };

  @ApiProperty()
  surface: { surfaceType: string };

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isCertified: boolean;
}