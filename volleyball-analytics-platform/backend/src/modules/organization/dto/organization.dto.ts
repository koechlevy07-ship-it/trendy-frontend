import { IsString, IsEmail, IsUrl, IsOptional, IsNumber, IsEnum, IsDateString, IsUUID, ValidateNested, IsBoolean, IsArray, Length, Matches } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { OrganizationType, OrganizationStatus } from '../schemas/organization.model';

// ============================================================================
// ADDRESS DTO
// ============================================================================

export class AddressDTO {
  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @Length(1, 255)
  street: string;

  @ApiProperty({ example: 'San Francisco' })
  @IsString()
  @Length(1, 100)
  city: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  @Length(1, 50)
  stateProvince: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, { message: 'Country must be a 2-letter ISO code' })
  country: string;

  @ApiProperty({ example: '94105' })
  @IsString()
  @Length(1, 20)
  postalCode: string;

  @ApiProperty({ example: '123 Main St, San Francisco, CA 94105' })
  @IsString()
  @Length(1, 500)
  physicalAddress: string;

  @ApiProperty({ example: { latitude: 37.7749, longitude: -122.4194 }, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

// ============================================================================
// CONTACT DTO
// ============================================================================

export class ContactDTO {
  @ApiProperty({ example: 'contact@organization.org', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1-555-123-4567', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  phone?: string;

  @ApiProperty({ example: 'https://organization.org', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  primaryContactPerson?: string;

  @ApiProperty({ example: '+1-555-987-6543', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  primaryContactPhone?: string;

  @ApiProperty({ example: 'support@organization.org', required: false })
  @IsOptional()
  @IsEmail()
  supportEmail?: string;
}

// ============================================================================
// BRANDING DTO
// ============================================================================

export class BrandingDTO {
  @ApiProperty({ example: '#3B82F6', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Primary color must be a valid hex color' })
  primaryColor?: string;

  @ApiProperty({ example: '#1E40AF', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Secondary color must be a valid hex color' })
  secondaryColor?: string;

  @ApiProperty({ example: '#60A5FA', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Accent color must be a valid hex color' })
  accentColor?: string;

  @ApiProperty({ example: 'https://organization.org/logo.png', required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ example: 'https://organization.org/logo-dark.png', required: false })
  @IsOptional()
  @IsUrl()
  logoDarkUrl?: string;

  @ApiProperty({ example: 'https://organization.org/logo-light.png', required: false })
  @IsOptional()
  @IsUrl()
  logoLightUrl?: string;

  @ApiProperty({ example: 'https://organization.org/favicon.ico', required: false })
  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @ApiProperty({ example: 'https://organization.org/banner.jpg', required: false })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @ApiProperty({ example: 'https://organization.org/branding-guidelines.pdf', required: false })
  @IsOptional()
  @IsUrl()
  brandingGuidelinesUrl?: string;

  @ApiProperty({ example: 'Panthers', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  mascot?: string;

  @ApiProperty({ example: 'Official Panther Organization', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  organizationTheme?: string;
}

// ============================================================================
// AI METADATA DTO
// ============================================================================

export class AIMetadataDTO {
  @ApiProperty({ example: [0.1, 0.2, 0.3, 0.4, 0.5], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  organizationEmbedding?: number[];

  @ApiProperty({ example: { primary: [0.1, 0.2], secondary: [0.3, 0.4], accent: [0.5, 0.6] }, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  teamColorProfile?: {
    primary: number[];
    secondary: number[];
    accent: number[];
  };

  @ApiProperty({ example: { home: { pattern: 'stripes', colors: ['#FF0000', '#0000FF'] } }, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  jerseyTemplates?: {
    home?: { pattern: string; colors: string[] };
    away?: { pattern: string; colors: string[] };
    alternate?: { pattern: string; colors: string[] };
  };

  @ApiProperty({ example: ['logo1.png', 'logo2.png'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  logoReferences?: string[];

  @ApiProperty({ example: { defaultCourtType: 'indoor', preferredLighting: 'bright', cameraPositions: [[1, 2], [3, 4]] }, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  courtPreferences?: {
    defaultCourtType?: string;
    preferredLighting?: string;
    cameraPositions?: number[][];
  };
}

// ============================================================================
// REGISTRATION DTO
// ============================================================================

export class RegistrationDTO {
  @ApiProperty({ example: 'REG-2024-001' })
  @IsString()
  @Length(1, 50)
  registrationNumber: string;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  registrationDate: Date;

  @ApiProperty({ example: 'California Secretary of State' })
  @IsString()
  @Length(1, 100)
  registrationAuthority: string;

  @ApiProperty({ example: 'TAX-123456', required: false })
  @IsOptional()
  @IsString()
  taxIdentificationNumber?: string;

  @ApiProperty({ example: 'BUS-789012', required: false })
  @IsOptional()
  @IsString()
  businessLicenseNumber?: string;

  @ApiProperty({ example: 'verified', required: false })
  @IsOptional()
  verificationStatus?: string;

  @ApiProperty({ example: ['docs/registration.pdf', 'docs/tax.pdf'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  verificationDocuments?: string[];

  @ApiProperty({ example: 'John Smith', required: false })
  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @ApiProperty({ example: '2024-12-31T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  licenseExpiry?: Date;

  @ApiProperty({ example: 'LICENSE-456', required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string;
}

// ============================================================================
// CREATE ORGANIZATION DTO
// ============================================================================

export class CreateOrganizationDTO {
  @ApiProperty({ example: 'Atlantic City Volleyball Federation' })
  @IsString()
  @Length(1, 200)
  organizationName: string;

  @ApiProperty({ example: 'ACVF' })
  @IsString()
  @Length(1, 20)
  shortName: string;

  @ApiProperty({ example: 'Atlantic City Volleyball Federation' })
  @IsString()
  @Length(1, 200)
  displayName: string;

  @ApiProperty({ enum: OrganizationType })
  @IsEnum(OrganizationType)
  organizationType: OrganizationType;

  @ApiProperty({ example: 'https://acvf.org', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ example: '+1-609-555-0123', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  phone?: string;

  @ApiProperty({ example: 'info@acvf.org', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  primaryContactPerson?: string;

  @ApiProperty({ example: '+1-609-555-9876', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  primaryContactPhone?: string;

  @ApiProperty({ example: 'support@acvf.org', required: false })
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/)
  country: string;

  @ApiProperty({ example: 'New Jersey' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  stateProvince?: string;

  @ApiProperty({ example: 'Atlantic City' })
  @IsString()
  @Length(1, 100)
  city: string;

  @ApiProperty({ example: '08401' })
  @IsString()
  @Length(1, 20)
  postalCode: string;

  @ApiProperty({ example: '123 Atlantic Avenue, Atlantic City, NJ 08401' })
  @IsString()
  @Length(1, 500)
  physicalAddress: string;

  @ApiProperty({ example: 'Club President', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  organizationAdmin?: string;

  @ApiProperty({ example: 'https://acvf.org/logo.png', required: false })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({ example: '#E41B17', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  primaryColor?: string;

  @ApiProperty({ example: '#0056B3', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  secondaryColor?: string;

  @ApiProperty({ example: '#FFA500', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  accentColor?: string;

  @ApiProperty({ example: 'federation@state.gov', required: false })
  @IsOptional()
  @IsString()
  governingBodyId?: string;

  @ApiProperty({ example: 'State Volleyball Federation', required: false })
  @IsOptional()
  @IsString()
  governingBodyName?: string;

  @ApiProperty({ example: '2020-06-15T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  affiliationDate?: Date;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @IsOptional()
  governanceTier?: number;

  @ApiProperty({ example: 'global' })
  @IsString()
  @Length(1, 50)
  dataRegion: string;

  @ApiProperty({ example: 'tenant-123' })
  @IsString()
  @Length(1, 50)
  tenantId: string;

  @ValidateNested()
  @Type(() => AddressDTO)
  address: AddressDTO;

  @ValidateNested()
  @Type(() => ContactDTO)
  contact: ContactDTO;

  @ValidateNested()
  @Type(() => RegistrationDTO)
  registration: RegistrationDTO;

  @ValidateNested()
  @Type(() => BrandingDTO)
  @IsOptional()
  branding?: BrandingDTO;

  @ValidateNested()
  @Type(() => AIMetadataDTO)
  @IsOptional()
  aiMetadata?: AIMetadataDTO;

  @ApiProperty({ example: 'parent-org-123', required: false })
  @IsOptional()
  @IsUUID()
  parentOrganizationId?: string;
}

// ============================================================================
// UPDATE ORGANIZATION DTO
// ============================================================================

export class UpdateOrganizationDTO {
  @ApiProperty({ example: 'Atlantic City Volleyball Federation - Revised', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  organizationName?: string;

  @ApiProperty({ example: 'ACVF-R', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  shortName?: string;

  @ApiProperty({ example: 'Atlantic City Volleyball Federation (Updated)', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  displayName?: string;

  @ApiProperty({ example: '+1-609-555-0123', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  phone?: string;

  @ApiProperty({ example: 'info@acvf.org', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Jane Smith', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  primaryContactPerson?: string;

  @ApiProperty({ example: '+1-609-555-9876', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  primaryContactPhone?: string;

  @ApiProperty({ example: 'support@acvf.org', required: false })
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiProperty({ example: 'New Jersey', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  stateProvince?: string;

  @ApiProperty({ example: 'Atlantic City', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @ApiProperty({ example: '08401', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  postalCode?: string;

  @ApiProperty({ example: '123 Atlantic Avenue, Atlantic City, NJ 08401', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  physicalAddress?: string;

  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  organizationAdmin?: string;

  @ApiProperty({ example: 'https://acvf.org/logo-updated.png', required: false })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({ example: '#2E86AB', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  primaryColor?: string;

  @ApiProperty({ example: '#F24236', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  secondaryColor?: string;

  @ApiProperty({ example: '#2E86AB', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  accentColor?: string;

  @ApiProperty({ example: 'federation@state.gov', required: false })
  @IsOptional()
  @IsString()
  governingBodyId?: string;

  @ApiProperty({ example: 'State Volleyball Federation', required: false })
  @IsOptional()
  @IsString()
  governingBodyName?: string;

  @ApiProperty({ example: '2020-06-15T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  affiliationDate?: Date;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsOptional()
  governanceTier?: number;

  @ApiProperty({ example: 'regional' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  dataRegion?: string;

  @ValidateNested()
  @Type(() => AddressDTO)
  @IsOptional()
  address?: AddressDTO;

  @ValidateNested()
  @Type(() => ContactDTO)
  @IsOptional()
  contact?: ContactDTO;

  @ValidateNested()
  @Type(() => RegistrationDTO)
  @IsOptional()
  registration?: RegistrationDTO;

  @ValidateNested()
  @Type(() => BrandingDTO)
  @IsOptional()
  branding?: BrandingDTO;

  @ValidateNested()
  @Type(() => AIMetadataDTO)
  @IsOptional()
  aiMetadata?: AIMetadataDTO;
}

// ============================================================================
// PATCH ORGANIZATION VERIFY DTO
// ============================================================================

export class PatchOrganizationVerifyDTO {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  verifiedBy: string;

  @ApiProperty({ example: '2024-01-15T14:30:00.000Z' })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  verifiedAt: Date;

  @ApiProperty({ example: ['docs/registration.pdf', 'docs/tax.pdf', 'docs/bylaws.pdf'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  verificationDocuments?: string[];
}

// ============================================================================
// Organization Search DTOs
// ============================================================================

export class OrganizationSearchQuery {
  @ApiProperty({ example: 'volleyball', required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ enum: OrganizationType, required: false })
  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;

  @ApiProperty({ enum: OrganizationStatus, required: false })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @ApiProperty({ example: 'tenant-123', required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ example: '1', required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value.toString()))
  page?: number;

  @ApiProperty({ example: '20', required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value.toString()))
  perPage?: number;

  @ApiProperty({ example: 'createdAt', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ example: 'desc', required: false })
  @IsOptional()
  @IsEnum({ asc: 'asc', desc: 'desc' })
  sortOrder?: 'asc' | 'desc';
}