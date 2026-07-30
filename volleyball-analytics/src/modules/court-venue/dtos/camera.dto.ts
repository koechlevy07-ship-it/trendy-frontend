import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, IsMongoId, MinLength, MaxLength, Min, Max, IsObject, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { CameraMountType, CameraStatus, CameraManufacturer } from '../schemas/camera.schema';

export class CreateCameraPositionDto {
  @IsNumber() x!: number; @IsNumber() y!: number; @IsNumber() z!: number;
  @IsNumber() @Min(-180) @Max(180) roll!: number;
  @IsNumber() @Min(-90) @Max(90) pitch!: number;
  @IsNumber() @Min(-180) @Max(180) yaw!: number;
}

export class CreateCameraFOVDto {
  @IsNumber() @Min(1) @Max(180) horizontal!: number;
  @IsNumber() @Min(1) @Max(180) vertical!: number;
}

export class CreateCameraResolutionDto {
  @IsNumber() @Min(320) width!: number; @IsNumber() @Min(240) height!: number;
}

export class CreateCameraStreamConfigDto {
  @IsEnum(['rtsp','rtmp','http','https','websocket','srt','ndi']) protocol!: 'rtsp'|'rtmp'|'http'|'https'|'websocket'|'srt'|'ndi';
  @IsString() @IsNotEmpty() @IsUrl() url!: string;
  @IsString() @IsOptional() username?: string;
  @IsString() @IsOptional() password?: string;
  @IsString() @IsOptional() streamPath?: string;
  @IsString() @IsOptional() @IsUrl() backupUrl?: string;
  @IsEnum(['tcp','udp','multicast']) @IsOptional() transport?: 'tcp'|'udp'|'multicast';
}

export class CreateCameraSpecsDto {
  @IsString() @IsNotEmpty() sensorType!: string; @IsString() @IsNotEmpty() sensorSize!: string;
  @IsNumber() @Min(1) focalLength!: number; @IsString() @IsNotEmpty() aperture!: string;
  @IsString() @IsNotEmpty() isoRange!: string; @IsString() @IsNotEmpty() shutterSpeedRange!: string;
  @IsArray() @IsString({ each: true }) whiteBalance!: string[];
  @IsArray() @IsString({ each: true }) focusMode!: string[];
}

export class CreateCameraDto {
  @IsMongoId() @IsNotEmpty() courtId!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(50) cameraId!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(100) name!: string;
  @IsEnum(CameraManufacturer) manufacturer!: CameraManufacturer;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(100) model!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(100) serialNumber!: string;
  @IsString() @IsOptional() firmwareVersion?: string;
  @IsEnum(CameraMountType) mountType!: CameraMountType;
  @ValidateNested() @Type(() => CreateCameraPositionDto) position!: CreateCameraPositionDto;
  @ValidateNested() @Type(() => CreateCameraFOVDto) fieldOfView!: CreateCameraFOVDto;
  @ValidateNested() @Type(() => CreateCameraResolutionDto) resolution!: CreateCameraResolutionDto;
  @IsNumber() @Min(15) @Max(240) frameRate!: number;
  @IsNumber() @IsOptional() bitrate?: number;
  @IsString() @IsOptional() codec?: string;
  @ValidateNested() @Type(() => CreateCameraStreamConfigDto) streamConfig!: CreateCameraStreamConfigDto;
  @ValidateNested() @Type(() => CreateCameraSpecsDto) specs!: CreateCameraSpecsDto;
  @IsEnum(CameraStatus) @IsOptional() status?: CameraStatus = CameraStatus.REGISTERED;
  @IsArray() @IsOptional() @IsMongoId({ each: true }) assignedCoverageZones?: string[] = [];
  @IsMongoId() @IsOptional() calibrationProfileId?: string;
  @IsObject() @IsOptional() metadata?: Record<string, unknown> = {};
  @IsMongoId() @IsNotEmpty() createdBy!: string;
}

export class UpdateCameraDto {
  @IsString() @IsOptional() @MinLength(1) @MaxLength(100) name?: string;
  @ValidateNested() @Type(() => CreateCameraPositionDto) @IsOptional() position?: CreateCameraPositionDto;
  @ValidateNested() @Type(() => CreateCameraFOVDto) @IsOptional() fieldOfView?: CreateCameraFOVDto;
  @IsNumber() @IsOptional() @Min(15) @Max(240) frameRate?: number;
  @ValidateNested() @Type(() => CreateCameraStreamConfigDto) @IsOptional() streamConfig?: CreateCameraStreamConfigDto;
  @IsEnum(CameraStatus) @IsOptional() status?: CameraStatus;
  @IsMongoId() @IsOptional() calibrationProfileId?: string;
  @IsArray() @IsOptional() @IsMongoId({ each: true }) assignedCoverageZones?: string[];
  @IsObject() @IsOptional() metadata?: Record<string, unknown>;
}

export class CameraSearchDto {
  @IsString() @IsOptional() search?: string;
  @IsMongoId() @IsOptional() courtId?: string;
  @IsEnum(CameraManufacturer) @IsOptional() manufacturer?: CameraManufacturer;
  @IsEnum(CameraMountType) @IsOptional() mountType?: CameraMountType;
  @IsEnum(CameraStatus) @IsOptional() status?: CameraStatus;
  @IsNumber() @IsOptional() @Min(1) page?: number = 1;
  @IsNumber() @IsOptional() @Min(1) @Max(100) limit?: number = 20;
  @IsString() @IsOptional() sortBy?: string = 'createdAt';
  @IsString() @IsOptional() sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ActivateCameraDto { @IsMongoId() @IsNotEmpty() cameraId!: string; }

export class CalibrateCameraDto { @IsMongoId() @IsNotEmpty() cameraId!: string; @IsMongoId() @IsNotEmpty() calibrationProfileId!: string; }

export class CameraResponseDto {
  id!: string; cameraId!: string; courtId!: string; name!: string; manufacturer!: CameraManufacturer;
  model!: string; serialNumber!: string; firmwareVersion?: string; mountType!: CameraMountType;
  position!: CreateCameraPositionDto; fieldOfView!: CreateCameraFOVDto; resolution!: CreateCameraResolutionDto;
  frameRate!: number; bitrate?: number; codec?: string; streamConfig!: CreateCameraStreamConfigDto;
  specs!: CreateCameraSpecsDto; status!: CameraStatus; assignedCoverageZones!: string[];
  calibrationProfileId?: string; metadata!: Record<string, unknown>;
  lastHeartbeat?: Date; errorMessage?: string; connectedAt?: Date; activatedAt?: Date;
  calibratedAt?: Date; decommissionedAt?: Date; createdAt!: Date; updatedAt!: Date;
}

export class CameraPaginatedResponseDto { data!: CameraResponseDto[]; total!: number; page!: number; limit!: number; totalPages!: number; }