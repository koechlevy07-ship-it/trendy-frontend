import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, ValidateNested, IsMongoId, Min, Max, MinLength, MaxLength, IsObject, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { CourtType, SurfaceType, CourtOrientation, CourtStatus, MaintenanceStatus } from '../schemas/court.schema';

export class CreateCourtDimensionsDto {
  @IsNumber() @Min(10) @Max(50) length!: number;
  @IsNumber() @Min(10) @Max(30) width!: number;
  @IsNumber() @Min(2) @Max(10) freeZoneLength!: number;
  @IsNumber() @Min(2) @Max(10) freeZoneWidth!: number;
  @IsNumber() @Min(1.5) @Max(3) netHeight!: number;
  @IsNumber() @Min(2.5) @Max(4) attackLineDistance!: number;
  @IsNumber() @Min(8) @Max(10) serviceZoneWidth!: number;
  @IsNumber() @IsOptional() @Min(7) @Max(30) ceilingHeight?: number;
}

export class CreateCourtEquipmentDto {
  @IsString() @IsNotEmpty() netSystem!: string;
  @IsString() @IsNotEmpty() posts!: string;
  @IsString() @IsNotEmpty() antennas!: string;
  @IsString() @IsNotEmpty() scoreboard!: string;
  @IsString() @IsNotEmpty() refereeStand!: string;
  @IsString() @IsNotEmpty() lighting!: string;
  @IsString() @IsNotEmpty() flooring!: string;
}

export class CreateCourtAIConfigurationDto {
  @IsMongoId() @IsOptional() cameraProfileId?: string;
  @IsMongoId() @IsOptional() calibrationProfileId?: string;
  @IsBoolean() @IsOptional() trackingEnabled?: boolean = true;
  @IsBoolean() @IsOptional() actionRecognitionEnabled?: boolean = true;
  @IsBoolean() @IsOptional() poseEstimationEnabled?: boolean = true;
  @IsBoolean() @IsOptional() ballTrackingEnabled?: boolean = true;
  @IsBoolean() @IsOptional() jerseyDetectionEnabled?: boolean = true;
  @IsObject() @IsOptional() customModelConfig?: Record<string, unknown> = {};
}

export class CreateCourtDto {
  @IsMongoId() @IsNotEmpty() venueId!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(50) courtCode!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(200) courtName!: string;
  @IsEnum(CourtType) @IsNotEmpty() courtType!: CourtType;
  @IsEnum(SurfaceType) @IsNotEmpty() surfaceType!: SurfaceType;
  @ValidateNested() @Type(() => CreateCourtDimensionsDto) @IsNotEmpty() dimensions!: CreateCourtDimensionsDto;
  @IsEnum(CourtOrientation) @IsNotEmpty() orientation!: CourtOrientation;
  @IsEnum(CourtStatus) @IsOptional() status?: CourtStatus = CourtStatus.DRAFT;
  @ValidateNested() @Type(() => CreateCourtEquipmentDto) @IsNotEmpty() equipment!: CreateCourtEquipmentDto;
  @ValidateNested() @Type(() => CreateCourtAIConfigurationDto) @IsNotEmpty() aiConfiguration!: CreateCourtAIConfigurationDto;
  @IsArray() @IsOptional() @IsMongoId({ each: true }) assignedCameraIds?: string[] = [];
  @IsObject() @IsOptional() metadata?: Record<string, unknown> = {};
  @IsMongoId() @IsNotEmpty() createdBy!: string;
}

export class UpdateCourtDto {
  @IsBoolean() @IsOptional() availability?: boolean;
  @IsEnum(MaintenanceStatus) @IsOptional() maintenanceStatus?: MaintenanceStatus;
  @IsArray() @IsOptional() equipment?: string[];
  @IsMongoId() @IsOptional() cameraProfile?: string;
  @IsMongoId() @IsOptional() calibrationProfile?: string;
  @IsObject() @IsOptional() metadata?: Record<string, unknown>;
}

export class CourtSearchDto {
  @IsString() @IsOptional() search?: string;
  @IsMongoId() @IsOptional() venueId?: string;
  @IsEnum(CourtType) @IsOptional() courtType?: CourtType;
  @IsEnum(SurfaceType) @IsOptional() surfaceType?: SurfaceType;
  @IsEnum(CourtStatus) @IsOptional() status?: CourtStatus;
  @IsEnum(MaintenanceStatus) @IsOptional() maintenanceStatus?: MaintenanceStatus;
  @IsNumber() @IsOptional() @Min(1) page?: number = 1;
  @IsNumber() @IsOptional() @Min(1) @Max(100) limit?: number = 20;
  @IsString() @IsOptional() sortBy?: string = 'createdAt';
  @IsString() @IsOptional() sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ActivateCourtDto { @IsMongoId() @IsNotEmpty() activatedBy!: string; }

export class SetMaintenanceDto {
  @IsBoolean() @IsNotEmpty() isUnderMaintenance!: boolean;
  @IsDate() @IsOptional() maintenanceStartDate?: Date;
  @IsDate() @IsOptional() maintenanceEndDate?: Date;
  @IsString() @IsOptional() @MinLength(1) @MaxLength(500) maintenanceReason?: string;
  @IsArray() @IsOptional() @IsDate({ each: true }) scheduledMaintenance?: Date[];
}

export class AssignCameraDto { @IsMongoId() @IsNotEmpty() cameraId!: string; }

export class CourtResponseDto {
  id!: string; courtCode!: string; courtName!: string; venueId!: string; courtType!: CourtType;
  surfaceType!: SurfaceType; dimensions!: CreateCourtDimensionsDto; orientation!: CourtOrientation;
  status!: CourtStatus; maintenanceStatus!: MaintenanceStatus; equipment!: CreateCourtEquipmentDto;
  aiConfiguration!: CreateCourtAIConfigurationDto; assignedCameraIds!: string[];
  activeCalibrationId?: string; metadata!: Record<string, unknown>;
  activatedAt?: Date; activatedBy?: string; suspendedAt?: Date; suspendedBy?: string;
  archivedAt?: Date; archivedBy?: string; maintenanceScheduledAt?: Date; maintenanceCompletedAt?: Date;
  createdAt!: Date; updatedAt!: Date;
}

export class CourtPaginatedResponseDto { data!: CourtResponseDto[]; total!: number; page!: number; limit!: number; totalPages!: number; }