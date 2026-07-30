import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, IsMongoId, Min, Max, MinLength, MaxLength, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CalibrationStatus, CalibrationMethod } from '../schemas/calibration.schema';

export class CreateIntrinsicParametersDto {
  @IsNumber() focalLengthX!: number; @IsNumber() focalLengthY!: number;
  @IsNumber() principalPointX!: number; @IsNumber() principalPointY!: number;
  @IsNumber() skew!: number; @IsArray() @IsNumber({}, { each: true }) distortionCoefficients!: number[];
}

export class CreateExtrinsicParametersDto {
  @IsArray() @IsNumber({}, { each: true }) rotationMatrix!: number[][];
  @IsArray() @IsNumber({}, { each: true }) translationVector!: number[];
  @IsNumber() cameraHeight!: number; @IsNumber() cameraTilt!: number;
  @IsNumber() cameraPan!: number; @IsNumber() cameraRoll!: number;
}

export class CreateReferencePointDto {
  @IsString() @IsNotEmpty() id!: string; @IsString() @IsNotEmpty() name!: string;
  @ValidateNested() @Type(() => CreateWorldCoordinatesDto) worldCoordinates!: CreateWorldCoordinatesDto;
  @ValidateNested() @Type(() => CreateImageCoordinatesDto) imageCoordinates!: CreateImageCoordinatesDto;
  @IsNumber() @Min(0) @Max(1) confidence!: number;
}

export class CreateWorldCoordinatesDto { @IsNumber() x!: number; @IsNumber() y!: number; @IsNumber() z!: number; }
export class CreateImageCoordinatesDto { @IsNumber() x!: number; @IsNumber() y!: number; }

export class CreateHomographyMatrixDto {
  @IsArray() @IsNumber({}, { each: true }) matrix!: number[][];
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreateImageCoordinatesDto) sourcePoints!: CreateImageCoordinatesDto[];
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreateImageCoordinatesDto) destinationPoints!: CreateImageCoordinatesDto[];
}

export class CreateCalibrationMetricsDto {
  @IsNumber() @Min(0) reprojectionError!: number; @IsNumber() @Min(0) rmsError!: number;
  @IsNumber() @Min(0) maxError!: number; @IsNumber() @Min(0) standardDeviation!: number;
  @IsNumber() @Min(4) pointCount!: number; @IsNumber() @Min(4) validPointCount!: number;
}

export class CreateCalibrationProfileDto {
  @IsMongoId() @IsNotEmpty() cameraInstallationId!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(200) profileName!: string;
  @IsEnum(CalibrationMethod) @IsNotEmpty() method!: CalibrationMethod;
  @ValidateNested() @Type(() => CreateIntrinsicParametersDto) intrinsicParameters!: CreateIntrinsicParametersDto;
  @ValidateNested() @Type(() => CreateExtrinsicParametersDto) extrinsicParameters!: CreateExtrinsicParametersDto;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreateReferencePointDto) referencePoints!: CreateReferencePointDto[];
  @ValidateNested() @Type(() => CreateHomographyMatrixDto) homographyMatrix!: CreateHomographyMatrixDto;
  @ValidateNested() @Type(() => CreateCalibrationMetricsDto) metrics!: CreateCalibrationMetricsDto;
  @IsObject() @IsOptional() aiMetadata?: Record<string, unknown>;
  @IsString() @IsOptional() notes?: string;
  @IsMongoId() @IsNotEmpty() createdBy!: string;
}

export class UpdateCalibrationProfileDto {
  @IsString() @IsOptional() @MinLength(1) @MaxLength(200) profileName?: string;
  @IsEnum(CalibrationStatus) @IsOptional() status?: CalibrationStatus;
  @ValidateNested() @Type(() => CreateIntrinsicParametersDto) @IsOptional() intrinsicParameters?: CreateIntrinsicParametersDto;
  @ValidateNested() @Type(() => CreateExtrinsicParametersDto) @IsOptional() extrinsicParameters?: CreateExtrinsicParametersDto;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreateReferencePointDto) @IsOptional() referencePoints?: CreateReferencePointDto[];
  @ValidateNested() @Type(() => CreateHomographyMatrixDto) @IsOptional() homographyMatrix?: CreateHomographyMatrixDto;
  @ValidateNested() @Type(() => CreateCalibrationMetricsDto) @IsOptional() metrics?: CreateCalibrationMetricsDto;
  @IsObject() @IsOptional() aiMetadata?: Record<string, unknown>;
  @IsString() @IsOptional() notes?: string;
}

export class CalibrationProfileSearchDto {
  @IsMongoId() @IsOptional() cameraInstallationId?: string;
  @IsEnum(CalibrationStatus) @IsOptional() status?: CalibrationStatus;
  @IsEnum(CalibrationMethod) @IsOptional() method?: CalibrationMethod;
  @IsNumber() @IsOptional() @Min(1) page?: number = 1;
  @IsNumber() @IsOptional() @Min(1) @Max(100) limit?: number = 20;
  @IsString() @IsOptional() sortBy?: string = 'createdAt';
  @IsString() @IsOptional() sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ActivateCalibrationDto { @IsMongoId() @IsNotEmpty() activatedBy!: string; }

export class ValidateCalibrationDto { @IsBoolean() @IsNotEmpty() passed!: boolean; @IsObject() @IsNotEmpty() details!: Record<string, unknown>; @IsMongoId() @IsNotEmpty() validatedBy!: string; }

export class CalibrationProfileResponseDto {
  id!: string; cameraInstallationId!: string; profileName!: string; version!: number;
  method!: CalibrationMethod; status!: CalibrationStatus;
  intrinsicParameters!: CreateIntrinsicParametersDto; extrinsicParameters!: CreateExtrinsicParametersDto;
  referencePoints!: CreateReferencePointDto[]; homographyMatrix!: CreateHomographyMatrixDto;
  metrics!: CreateCalibrationMetricsDto;
  validationResults?: { passed: boolean; details: Record<string, unknown>; validatedAt: Date; validatedBy: string; };
  aiMetadata!: Record<string, unknown>; notes?: string;
  createdBy!: string; activatedAt?: Date; activatedBy?: string; archivedAt?: Date; archivedBy?: string;
  createdAt!: Date; updatedAt!: Date;
}

export class CalibrationProfilePaginatedResponseDto { data!: CalibrationProfileResponseDto[]; total!: number; page!: number; limit!: number; totalPages!: number; }