import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, IsMongoId, Min, Max, MinLength, MaxLength, IsEmail, IsPhoneNumber, IsUrl, Matches, IsBoolean, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { VenueType, VenueStatus } from '../schemas/venue.schema';

export class CreateVenueAddressDto {
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(200) street!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(100) city!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(100) state!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(100) country!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(20) postalCode!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(300) formattedAddress!: string;
}

export class CreateVenueContactDto {
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(100) name!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(100) role!: string;
  @IsEmail() @IsNotEmpty() email!: string;
  @IsPhoneNumber() @IsNotEmpty() phone!: string;
  @IsBoolean() @IsOptional() isPrimary?: boolean = false;
}

export class CreateVenueOperatingHoursDto {
  @IsNumber() @Min(0) @Max(6) dayOfWeek!: number;
  @IsString() @IsNotEmpty() @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/) openTime!: string;
  @IsString() @IsNotEmpty() @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/) closeTime!: string;
  @IsBoolean() @IsOptional() isClosed?: boolean = false;
}

export class CreateVenueDto {
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(200) venueName!: string;
  @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(50) venueCode!: string;
  @IsMongoId() @IsNotEmpty() organizationId!: string;
  @IsEnum(VenueType) @IsNotEmpty() venueType!: VenueType;
  @ValidateNested() @Type(() => CreateVenueAddressDto) @IsNotEmpty() address!: CreateVenueAddressDto;
  @IsNumber() @Min(-90) @Max(90) latitude!: number;
  @IsNumber() @Min(-180) @Max(180) longitude!: number;
  @IsNumber() @Min(0) capacity!: number;
  @ValidateNested({ each: true }) @Type(() => CreateVenueContactDto) @IsArray() @IsOptional() contacts?: CreateVenueContactDto[] = [];
  @ValidateNested({ each: true }) @Type(() => CreateVenueOperatingHoursDto) @IsArray() @IsOptional() operatingHours?: CreateVenueOperatingHoursDto[] = [];
  @IsBoolean() @IsOptional() certificationRequired?: boolean = false;
  @IsArray() @IsOptional() @IsUrl({}, { each: true }) mediaAssets?: string[] = [];
  @IsArray() @IsOptional() @IsMongoId({ each: true }) documents?: string[] = [];
  @IsObject() @IsOptional() metadata?: Record<string, unknown> = {};
  @IsString() @IsOptional() timezone?: string = 'UTC';
}

export class UpdateVenueDto {
  @IsString() @IsOptional() @MinLength(1) @MaxLength(200) venueName?: string;
  @ValidateNested({ each: true }) @Type(() => CreateVenueContactDto) @IsArray() @IsOptional() contacts?: CreateVenueContactDto[];
  @IsNumber() @IsOptional() @Min(0) capacity?: number;
  @IsEnum(VenueStatus) @IsOptional() status?: VenueStatus;
  @IsArray() @IsOptional() @IsUrl({}, { each: true }) mediaAssets?: string[];
  @IsArray() @IsOptional() @IsMongoId({ each: true }) documents?: string[];
  @IsObject() @IsOptional() metadata?: Record<string, unknown>;
}

export class ActivateVenueDto { @IsMongoId() @IsNotEmpty() activatedBy!: string; }
export class SuspendVenueDto { @IsMongoId() @IsNotEmpty() suspendedBy!: string; @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(500) suspendedReason!: string; }
export class ArchiveVenueDto { @IsMongoId() @IsNotEmpty() archivedBy!: string; }
export class RestoreVenueDto { @IsMongoId() @IsNotEmpty() restoredBy!: string; }

export class VenueSearchDto {
  @IsString() @IsOptional() search?: string;
  @IsMongoId() @IsOptional() organizationId?: string;
  @IsEnum(VenueType) @IsOptional() venueType?: VenueType;
  @IsEnum(VenueStatus) @IsOptional() status?: VenueStatus;
  @IsNumber() @IsOptional() @Min(1) page?: number = 1;
  @IsNumber() @IsOptional() @Min(1) @Max(100) limit?: number = 20;
  @IsString() @IsOptional() sortBy?: string = 'createdAt';
  @IsString() @IsOptional() sortOrder?: 'asc' | 'desc' = 'desc';
  @IsNumber() @IsOptional() @Min(-90) @Max(90) latitude?: number;
  @IsNumber() @IsOptional() @Min(-180) @Max(180) longitude?: number;
  @IsNumber() @IsOptional() @Min(0) radiusKm?: number;
}

export class VenueResponseDto {
  id!: string; venueCode!: string; venueName!: string; organizationId!: string; venueType!: VenueType; status!: VenueStatus;
  address!: CreateVenueAddressDto; coordinates!: { latitude: number; longitude: number }; capacity!: number;
  operatingHours!: CreateVenueOperatingHoursDto[]; contacts!: CreateVenueContactDto[];
  certificationRequired!: boolean; certificationId?: string; mediaAssets!: string[]; documents!: string[];
  metadata!: Record<string, unknown>; suspendedAt?: Date; suspendedBy?: string; suspendedReason?: string;
  activatedAt?: Date; activatedBy?: string; archivedAt?: Date; archivedBy?: string; createdAt!: Date; updatedAt!: Date;
}

export class VenuePaginatedResponseDto { data!: VenueResponseDto[]; total!: number; page!: number; limit!: number; totalPages!: number; }