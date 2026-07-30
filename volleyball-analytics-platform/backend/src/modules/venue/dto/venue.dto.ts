/**
 * Venue DTOs - Chapter 13 Part 1
 * 
 * Data Transfer Objects for Venue module
 */

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
  IsArray,
  IsBoolean,
  IsObject,
  ValidateNested,
  Type,
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  VenueType,
  VenueStatus,
  SurfaceType,
  CertificationStatus,
} from '../schemas/venue.schema';

// ============================================================================
// SUB-DTOs
// ============================================================================

export class VenueIdentityDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  shortName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ enum: VenueType })
  @IsEnum(VenueType)
  type: VenueType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  code?: string;
}

export class VenueOwnershipDTO {
  @ApiProperty()
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentOrganizationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  governingBodyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  governingBodyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  affiliationDate?: Date;

  @ApiProperty({ minimum: 0, maximum: 5, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(5)
  governanceTier: number;
}

export class VenueAddressDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  street: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 200)
  street2?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  stateProvince?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  county?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be a 2-letter ISO code' })
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  postalCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  directions?: string;
}

export class VenueContactDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  primaryContactPerson?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  primaryContactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export class VenueCapacityDTO {
  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  seatingCapacity: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standingCapacity?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vipCapacity?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wheelchairCapacity?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  staffCapacity?: number;
}

export class GeoCoordinatesDTO {
  @ApiProperty({ minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coordinateSystem?: string;
}

export class VenueFacilitiesDTO {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  changingRooms?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalRooms?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  officialsRooms?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaRooms?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  broadcastFacilities?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vipLounges?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  warmupAreas?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentStores?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  parkingAreas?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lightingSystem?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  internetConnectivity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  powerSupply?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  waterSupply?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  hvacSystem?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessibilityFeatures?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyEquipment?: string[];
}

export class VenueCertificationDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  certificationId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  issuingAuthority: string;

  @ApiProperty()
  @IsDateString()
  @Type(() => Date)
  issuedDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  expiryDate?: Date;

  @ApiProperty({ enum: CertificationStatus, default: 'pending' })
  @IsEnum(CertificationStatus)
  status: CertificationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  certificateNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  certificateUrl?: string.

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scope?: string[].

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  certifiedBy?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  certifiedAt?: Date.
}

export class CameraInfrastructureDTO {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cameraPositions?: string[].

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cameraIdentifiers?: string[].

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  viewingAngles?: number[].

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coverageZones?: string[].

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  calibrationProfiles?: string[].

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  primaryCameraId?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  streamingConfig?: {
    primaryStreamUrl: string;
    backupStreamUrl?: string;
    protocol: string;
    bitrate: number;
    resolution: string;
  }.

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  aiProcessingConfig?: {
    enabledModules: string[];
    confidenceThreshold: number;
    realTimeProcessing: boolean;
  }.
}

export class MediaAssetsDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoDarkUrl?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoLightUrl?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  bannerUrl?: string.

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImages?: string[].

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  virtualTourUrl?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  floorPlanUrl?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  sitePlanUrl?: string.
}

export class AIRecipeDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  recognitionProfileId?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  preferredCourtTemplate?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  jerseyRecognitionTemplate?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  logoRecognitionProfile?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  courtPreferences?: string.

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  organizationEmbedding?: number[].

}

export class VenueAuditInfoDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  createdBy?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  updatedBy?: string.

  @ApiProperty({ default: 0 })
  @IsNumber()
  @Min(0)
  version: number.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  auditReference?: string.
}

export class VenueArchiveDTO {
  @ApiProperty({ default: false })
  @IsBoolean()
  isArchived: boolean.

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  archivedAt?: Date.

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  archivedBy?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  archiveReason?: string.
}

// ============================================================================
// MAIN DTOs
// ============================================================================

export class CreateVenueDTO {
  @ApiProperty({ type: VenueIdentityDTO })
  @ValidateNested()
  @Type(() => VenueIdentityDTO)
  identity: VenueIdentityDTO;

  @ApiProperty({ type: VenueOwnershipDTO })
  @ValidateNested()
  @Type(() => VenueOwnershipDTO)
  ownership: VenueOwnershipDTO;

  @ApiProperty({ type: VenueAddressDTO })
  @ValidateNested()
  @Type(() => VenueAddressDTO)
  address: VenueAddressDTO;

  @ApiProperty({ type: GeoCoordinatesDTO })
  @ValidateNested()
  @Type(() => GeoCoordinatesDTO)
  coordinates: GeoCoordinatesDTO;

  @ApiProperty({ type: VenueContactDTO })
  @ValidateNested()
  @Type(() => VenueContactDTO)
  contact: VenueContactDTO;

  @ApiProperty({ type: VenueCapacityDTO })
  @ValidateNested()
  @Type(() => VenueCapacityDTO)
  capacity: VenueCapacityDTO.

  @ApiProperty({ type: VenueFacilitiesDTO })
  @ValidateNested()
  @Type(() => VenueFacilitiesDTO)
  facilities: VenueFacilitiesDTO.

  @ApiPropertyOptional({ type: [VenueCertificationDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VenueCertificationDTO)
  certifications?: VenueCertificationDTO[].

  @ApiProperty({ type: CameraInfrastructureDTO })
  @ValidateNested()
  @Type(() => CameraInfrastructureDTO)
  cameraInfrastructure: CameraInfrastructureDTO.

  @ApiPropertyOptional({ type: MediaAssetsDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetsDTO)
  mediaAssets?: MediaAssetsDTO.

  @ApiPropertyOptional({ type: AIRecipeDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIRecipeDTO)
  aiMetadata?: AIRecipeDTO.
}

export class UpdateVenueDTO {
  @ApiPropertyOptional({ type: VenueIdentityDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => VenueIdentityDTO)
  identity?: VenueIdentityDTO.

  @ApiPropertyOptional({ type: VenueOwnershipDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => VenueOwnershipDTO)
  ownership?: VenueOwnershipDTO.

  @ApiPropertyOptional({ type: VenueAddressDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => VenueAddressDTO)
  address?: VenueAddressDTO.

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  coordinates?: Partial<GeoCoordinatesDTO>.

  @ApiPropertyOptional({ type: VenueContactDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => VenueContactDTO)
  contact?: VenueContactDTO.

  @ApiPropertyOptional({ type: VenueCapacityDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => VenueCapacityDTO)
  capacity?: VenueCapacityDTO.

  @ApiPropertyOptional({ type: VenueFacilitiesDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => VenueFacilitiesDTO)
  facilities?: VenueFacilitiesDTO.

  @ApiPropertyOptional({ type: [VenueCertificationDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VenueCertificationDTO)
  certifications?: VenueCertificationDTO[].

  @ApiPropertyOptional({ type: CameraInfrastructureDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => CameraInfrastructureDTO)
  cameraInfrastructure?: CameraInfrastructureDTO.

  @ApiPropertyOptional({ type: MediaAssetsDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetsDTO)
  mediaAssets?: MediaAssetsDTO.

  @ApiPropertyOptional({ type: AIRecipeDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIRecipeDTO)
  aiMetadata?: AIRecipeDTO.
}

export class VenueSearchDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string.

  @ApiPropertyOptional({ enum: VenueType })
  @IsOptional()
  @IsEnum(VenueType)
  type?: VenueType.

  @ApiPropertyOptional({ enum: VenueStatus })
  @IsOptional()
  @IsEnum(VenueStatus)
  status?: VenueStatus.

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  organizationId?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string.

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number.

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  perPage?: number.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string.

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc'.
}

export class VenueResponseDTO {
  @ApiProperty()
  id: string.

  @ApiProperty()
  venueId: string.

  @ApiProperty()
  name: string.

  @ApiProperty()
  shortName: string.

  @ApiProperty()
  displayName?: string.

  @ApiProperty({ enum: VenueType })
  type: VenueType.

  @ApiProperty({ enum: VenueStatus })
  status: VenueStatus.

  @ApiProperty()
  organizationId: string.

  @ApiProperty()
  address: VenueAddressDTO.

  @ApiProperty()
  coordinates: GeoCoordinatesDTO.

  @ApiProperty()
  capacity: VenueCapacityDTO.

  @ApiProperty()
  courtCount: number.

  @ApiProperty()
  totalMatchesHosted: number.

  @ApiProperty()
  isActive: boolean.

  @ApiProperty()
  createdAt: Date.

  @ApiProperty()
  updatedAt: Date.
}

export class VenueSummaryDTO {
  @ApiProperty()
  id: string.

  @ApiProperty()
  venueId: string.

  @ApiProperty()
  name: string.

  @ApiProperty()
  shortName: string.

  @ApiProperty({ enum: VenueType })
  type: VenueType.

  @ApiProperty({ enum: VenueStatus })
  status: VenueStatus.

  @ApiProperty()
  organizationId: string.

  @ApiProperty({ type: GeoCoordinatesDTO })
  coordinates: GeoCoordinatesDTO.

  @ApiProperty()
  capacity: VenueCapacityDTO.

  @ApiProperty()
  courtCount: number.

  @ApiProperty()
  certificationCount: number.
}