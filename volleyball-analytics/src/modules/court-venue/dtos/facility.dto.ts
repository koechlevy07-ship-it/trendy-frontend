import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, IsMongoId, Min, Max, MinLength, MaxLength, IsObject, IsBoolean, IsDate, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { FacilityType, FacilityStatus } from '../schemas/facility.schema';

export class CreateFacilityCapacityDto { @IsNumber() @Min(0) seated!: number; @IsNumber() @Min(0) standing!: number; @IsNumber() @Min(0) wheelchairAccessible!: number; @IsNumber() @Min(0) maxOccupancy!: number; }
export class CreateFacilityDimensionsDto { @IsNumber() @Min(0) length!: number; @IsNumber() @Min(0) width!: number; @IsNumber() @Min(0) height!: number; @IsNumber() @Min(0) area!: number; @IsNumber() @Min(0) volume!: number; }
export class CreateFacilityFeaturesDto { @IsBoolean() hasHVAC!: boolean; @IsBoolean() hasWiFi!: boolean; @IsBoolean() hasPowerOutlets!: boolean; @IsBoolean() hasWaterSupply!: boolean; @IsBoolean() hasDrainage!: boolean; @IsBoolean() hasNaturalLight!: boolean; @IsBoolean() hasEmergencyLighting!: boolean; @IsBoolean() hasFireExtinguisher!: boolean; @IsBoolean() hasFirstAidKit!: boolean; @IsBoolean() hasSecurityCamera!: boolean; @IsBoolean() hasAccessControl!: boolean; @IsBoolean() isWheelchairAccessible!: boolean; @IsBoolean() hasAudioSystem!: boolean; @IsBoolean() hasVideoDisplay!: boolean; @IsBoolean() hasClimateControl!: boolean; @IsObject() customFeatures!: Record<string, unknown>; }
export class CreateFacilityLocationDto { @IsString() floor!: string; @IsString() section!: string; @IsString() roomNumber!: string; @ValidateNested() @Type(() => CreateCoordinatesDto) @IsOptional() coordinates?: CreateCoordinatesDto; @IsMongoId() @IsOptional() nearestCourt?: string; }
export class CreateCoordinatesDto { @IsNumber() x!: number; @IsNumber() y!: number; @IsNumber() z!: number; }
export class CreateMaintenanceScheduleDto { @IsEnum(['daily','weekly','monthly','quarterly','annually','as_needed']) frequency!: 'daily'|'weekly'|'monthly'|'quarterly'|'annually'|'as_needed'; @IsDate() @IsOptional() lastMaintenance?: Date; @IsDate() @IsOptional() nextMaintenance?: Date; @IsArray() @IsString({ each: true }) maintenanceTasks!: string[]; }
export class CreateCleaningScheduleDto { @IsEnum(['daily','weekly','monthly','after_each_use','as_needed']) frequency!: 'daily'|'weekly'|'monthly'|'after_each_use'|'as_needed'; @IsDate() @IsOptional() lastCleaning?: Date; @IsDate() @IsOptional() nextCleaning?: Date; @IsString() @IsNotEmpty() cleaningProtocol!: string; }
export class CreateAccessControlDto { @IsArray() @IsString({ each: true }) requiredAccessLevel!: string[]; @IsBoolean() requiresKeyCard!: boolean; @IsBoolean() requiresBiometric!: boolean; @IsArray() @ValidateNested({ each: true }) @Type(() => CreateAccessHoursDto) accessHours!: CreateAccessHoursDto[]; }
export class CreateAccessHoursDto { @IsString() @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/) start!: string; @IsString() @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/) end!: string; }

export class CreateFacilityDto {
  @IsMongoId() @IsNotEmpty() venueId!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(50) facilityCode!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(200) name!: string;
  @IsEnum(FacilityType) @IsNotEmpty() facilityType!: FacilityType;
  @IsString() @IsOptional() @MaxLength(1000) description?: string;
  @ValidateNested() @Type(() => CreateFacilityLocationDto) @IsNotEmpty() location!: CreateFacilityLocationDto;
  @ValidateNested() @Type(() => CreateFacilityCapacityDto) @IsNotEmpty() capacity!: CreateFacilityCapacityDto;
  @ValidateNested() @Type(() => CreateFacilityDimensionsDto) @IsNotEmpty() dimensions!: CreateFacilityDimensionsDto;
  @ValidateNested() @Type(() => CreateFacilityFeaturesDto) @IsNotEmpty() features!: CreateFacilityFeaturesDto;
  @IsEnum(FacilityStatus) @IsOptional() status?: FacilityStatus = FacilityStatus.AVAILABLE;
  @IsArray() @IsOptional() @IsMongoId({ each: true }) assignedEquipment?: string[] = [];
  @ValidateNested() @Type(() => CreateMaintenanceScheduleDto) @IsNotEmpty() maintenanceSchedule!: CreateMaintenanceScheduleDto;
  @ValidateNested() @Type(() => CreateCleaningScheduleDto) @IsNotEmpty() cleaningSchedule!: CreateCleaningScheduleDto;
  @ValidateNested() @Type(() => CreateAccessControlDto) @IsNotEmpty() accessControl!: CreateAccessControlDto;
  @IsObject() @IsOptional() metadata?: Record<string, unknown> = {};
  @IsMongoId() @IsNotEmpty() createdBy!: string;
}

export class UpdateFacilityDto {
  @IsString() @IsOptional() @MinLength(1) @MaxLength(200) name?: string;
  @IsString() @IsOptional() @MaxLength(1000) description?: string;
  @ValidateNested() @Type(() => CreateFacilityLocationDto) @IsOptional() location?: CreateFacilityLocationDto;
  @ValidateNested() @Type(() => CreateFacilityCapacityDto) @IsOptional() capacity?: CreateFacilityCapacityDto;
  @ValidateNested() @Type(() => CreateFacilityFeaturesDto) @IsOptional() features?: CreateFacilityFeaturesDto;
  @IsEnum(FacilityStatus) @IsOptional() status?: FacilityStatus;
  @IsArray() @IsOptional() @IsMongoId({ each: true }) assignedEquipment?: string[];
  @ValidateNested() @Type(() => CreateMaintenanceScheduleDto) @IsOptional() maintenanceSchedule?: CreateMaintenanceScheduleDto;
  @ValidateNested() @Type(() => CreateCleaningScheduleDto) @IsOptional() cleaningSchedule?: CreateCleaningScheduleDto;
  @ValidateNested() @Type(() => CreateAccessControlDto) @IsOptional() accessControl?: CreateAccessControlDto;
  @IsObject() @IsOptional() metadata?: Record<string, unknown>;
}

export class FacilitySearchDto {
  @IsString() @IsOptional() search?: string;
  @IsMongoId() @IsOptional() venueId?: string;
  @IsEnum(FacilityType) @IsOptional() facilityType?: FacilityType;
  @IsEnum(FacilityStatus) @IsOptional() status?: FacilityStatus;
  @IsMongoId() @IsOptional() nearestCourt?: string;
  @IsNumber() @IsOptional() @Min(1) page?: number = 1;
  @IsNumber() @IsOptional() @Min(1) @Max(100) limit?: number = 20;
}

export class FacilityResponseDto {
  id!: string; facilityCode!: string; name!: string; venueId!: string; facilityType!: FacilityType; status!: FacilityStatus; location!: CreateFacilityLocationDto; capacity!: CreateFacilityCapacityDto; dimensions!: CreateFacilityDimensionsDto; features!: CreateFacilityFeaturesDto; assignedEquipment!: string[]; maintenanceSchedule!: CreateMaintenanceScheduleDto; cleaningSchedule!: CreateCleaningScheduleDto; accessControl!: CreateAccessControlDto; utilizationMetrics!: { totalBookings: number; totalHoursUsed: number; averageOccupancyRate: number; peakUsageHours: number[]; lastUpdated: Date; }; metadata!: Record<string, unknown>; decommissionedAt?: Date; decommissionedReason?: string; createdAt!: Date; updatedAt!: Date;
}
export class FacilityPaginatedResponseDto { data!: FacilityResponseDto[]; total!: number; page!: number; limit!: number; totalPages!: number; }