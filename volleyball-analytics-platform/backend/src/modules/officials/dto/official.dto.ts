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
  IsEmail,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfficialRole, OfficialLevel, OfficialStatus } from '../schemas/official.schema';

export class CreateOfficialDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  middleName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @ApiProperty({ enum: OfficialRole })
  @IsEnum(OfficialRole)
  primaryRole: OfficialRole;

  @ApiPropertyOptional({ type: [OfficialRole] })
  @IsOptional()
  @IsArray()
  @IsEnum(OfficialRole, { each: true })
  secondaryRoles?: string[];

  @ApiProperty({ enum: OfficialLevel })
  @IsEnum(OfficialLevel)
  level: OfficialLevel;

  @ApiPropertyOptional({ enum: OfficialStatus, default: OfficialStatus.ACTIVE })
  @IsOptional()
  @IsEnum(OfficialStatus)
  status?: OfficialStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  federation?: string;

  @ApiProperty({ type: OfficialContactDTO })
  @ValidateNested()
  @Type(() => OfficialContactDTO)
  contact: OfficialContactDTO;

  @ApiPropertyOptional({ type: [OfficialCertificationDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfficialCertificationDTO)
  certifications?: OfficialCertificationDTO[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  licenseExpiryDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  preferences?: {
    preferredRoles: string[];
    preferredCompetitions: string[];
    maxMatchesPerWeek: number;
    maxTravelDistance: number;
    languages: string[];
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  documents?: {
    photoUrl?: string;
    cvUrl?: string;
    licenseUrl?: string;
    medicalCertificateUrl?: string;
    insuranceCertificateUrl?: string;
  };
}

export class UpdateOfficialDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  middleName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  displayName?: string;

  @ApiPropertyOptional({ enum: OfficialRole })
  @IsOptional()
  @IsEnum(OfficialRole)
  primaryRole?: OfficialRole;

  @ApiPropertyOptional({ type: [OfficialRole] })
  @IsOptional()
  @IsArray()
  @IsEnum(OfficialRole, { each: true })
  secondaryRoles?: string[];

  @ApiPropertyOptional({ enum: OfficialLevel })
  @IsOptional()
  @IsEnum(OfficialLevel)
  level?: OfficialLevel;

  @ApiPropertyOptional({ enum: OfficialStatus })
  @IsOptional()
  @IsEnum(OfficialStatus)
  status?: OfficialStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  federation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  licenseExpiryDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  preferences?: {
    preferredRoles: string[];
    preferredCompetitions: string[];
    maxMatchesPerWeek: number;
    maxTravelDistance: number;
    languages: string[];
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  documents?: {
    photoUrl?: string;
    cvUrl?: string;
    licenseUrl?: string;
    medicalCertificateUrl?: string;
    insuranceCertificateUrl?: string;
  };
}

export class OfficialContactDTO {
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
  @IsString()
  @Length(1, 500)
  address?: string;
}

export class OfficialCertificationDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  issuingBody: string;

  @ApiProperty()
  @IsDateString()
  @Type(() => Date)
  issuedDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  expiryDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  certificateUrl?: string;
}

export class OfficialAssignmentDTO {
  @ApiProperty()
  @IsMongoId()
  matchId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty()
  @IsDateString()
  @Type(() => Date)
  date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  performanceRating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class OfficialAvailabilityDTO {
  @ApiProperty()
  @IsDateString()
  @Type(() => Date)
  date: Date;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredRole?: string;
}

export class OfficialSearchDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: OfficialRole })
  @IsOptional()
  @IsEnum(OfficialRole)
  role?: string;

  @ApiPropertyOptional({ enum: OfficialLevel })
  @IsOptional()
  @IsEnum(OfficialLevel)
  level?: string;

  @ApiPropertyOptional({ enum: OfficialStatus })
  @IsOptional()
  @IsEnum(OfficialStatus)
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  federation?: string;

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

export class OfficialResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  officialId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  middleName?: string;

  @ApiPropertyOptional()
  displayName?: string;

  @ApiProperty({ enum: OfficialRole })
  primaryRole: OfficialRole;

  @ApiProperty({ type: [OfficialRole] })
  secondaryRoles: string[];

  @ApiProperty({ enum: OfficialLevel })
  level: OfficialLevel;

  @ApiProperty({ enum: OfficialStatus })
  status: OfficialStatus;

  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  nationality?: string;

  @ApiPropertyOptional()
  federation?: string;

  @ApiProperty()
  contact: OfficialContactDTO;

  @ApiProperty({ type: [OfficialCertificationResponseDTO] })
  certifications: OfficialCertificationResponseDTO[];

  @ApiProperty()
  statistics: OfficialStatisticsResponseDTO;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OfficialSummaryDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  officialId: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: OfficialRole })
  primaryRole: OfficialRole;

  @ApiProperty({ enum: OfficialLevel })
  level: OfficialLevel;

  @ApiProperty({ enum: OfficialStatus })
  status: OfficialStatus;

  @ApiPropertyOptional()
  federation?: string;
}

export class OfficialCertificationResponseDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  issuingBody: string;

  @ApiProperty()
  issuedDate: Date;

  @ApiPropertyOptional()
  expiryDate?: Date;

  @ApiPropertyOptional()
  certificateNumber?: string;

  @ApiPropertyOptional()
  certificateUrl?: string;
}

export class OfficialStatisticsResponseDTO {
  @ApiProperty()
  totalMatches: number;

  @ApiProperty()
  matchesAsFirstReferee: number;

  @ApiProperty()
  matchesAsSecondReferee: number;

  @ApiProperty()
  matchesAsLineJudge: number;

  @ApiProperty()
  matchesAsScorer: number;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  challengesHandled: number;

  @ApiProperty()
  challengesOverturned: number;
}

export class OfficialAssignmentResponseDTO {
  @ApiProperty()
  matchId: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  date: Date;

  @ApiPropertyOptional()
  venue?: string;

  @ApiPropertyOptional()
  performanceRating?: number;

  @ApiPropertyOptional()
  notes?: string;
}

export class OfficialAvailabilityResponseDTO {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  available: boolean;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  preferredRole?: string;
}