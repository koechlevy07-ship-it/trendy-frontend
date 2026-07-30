import { VenueType, VenueStatus } from '../schemas/venue.schema';
export declare class CreateVenueAddressDto {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    formattedAddress: string;
}
export declare class CreateVenueContactDto {
    name: string;
    role: string;
    email: string;
    phone: string;
    isPrimary?: boolean;
}
export declare class CreateVenueOperatingHoursDto {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
}
export declare class CreateVenueDto {
    venueName: string;
    venueCode: string;
    organizationId: string;
    venueType: VenueType;
    address: CreateVenueAddressDto;
    latitude: number;
    longitude: number;
    capacity: number;
    contacts?: CreateVenueContactDto[];
    operatingHours?: CreateVenueOperatingHoursDto[];
    certificationRequired?: boolean;
    mediaAssets?: string[];
    documents?: string[];
    metadata?: Record<string, unknown>;
    timezone?: string;
}
export declare class UpdateVenueDto {
    venueName?: string;
    contacts?: CreateVenueContactDto[];
    capacity?: number;
    status?: VenueStatus;
    mediaAssets?: string[];
    documents?: string[];
    metadata?: Record<string, unknown>;
}
export declare class ActivateVenueDto {
    activatedBy: string;
}
export declare class SuspendVenueDto {
    suspendedBy: string;
    suspendedReason: string;
}
export declare class ArchiveVenueDto {
    archivedBy: string;
}
export declare class RestoreVenueDto {
    restoredBy: string;
}
export declare class VenueSearchDto {
    search?: string;
    organizationId?: string;
    venueType?: VenueType;
    status?: VenueStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
}
export declare class VenueResponseDto {
    id: string;
    venueCode: string;
    venueName: string;
    organizationId: string;
    venueType: VenueType;
    status: VenueStatus;
    address: CreateVenueAddressDto;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    capacity: number;
    operatingHours: CreateVenueOperatingHoursDto[];
    contacts: CreateVenueContactDto[];
    certificationRequired: boolean;
    certificationId?: string;
    mediaAssets: string[];
    documents: string[];
    metadata: Record<string, unknown>;
    suspendedAt?: Date;
    suspendedBy?: string;
    suspendedReason?: string;
    activatedAt?: Date;
    activatedBy?: string;
    archivedAt?: Date;
    archivedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class VenuePaginatedResponseDto {
    data: VenueResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
//# sourceMappingURL=venue.dto.d.ts.map