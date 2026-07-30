import { FacilityType, FacilityStatus } from '../schemas/facility.schema';
export declare class CreateFacilityCapacityDto {
    seated: number;
    standing: number;
    wheelchairAccessible: number;
    maxOccupancy: number;
}
export declare class CreateFacilityDimensionsDto {
    length: number;
    width: number;
    height: number;
    area: number;
    volume: number;
}
export declare class CreateFacilityFeaturesDto {
    hasHVAC: boolean;
    hasWiFi: boolean;
    hasPowerOutlets: boolean;
    hasWaterSupply: boolean;
    hasDrainage: boolean;
    hasNaturalLight: boolean;
    hasEmergencyLighting: boolean;
    hasFireExtinguisher: boolean;
    hasFirstAidKit: boolean;
    hasSecurityCamera: boolean;
    hasAccessControl: boolean;
    isWheelchairAccessible: boolean;
    hasAudioSystem: boolean;
    hasVideoDisplay: boolean;
    hasClimateControl: boolean;
    customFeatures: Record<string, unknown>;
}
export declare class CreateFacilityLocationDto {
    floor: string;
    section: string;
    roomNumber: string;
    coordinates?: CreateCoordinatesDto;
    nearestCourt?: string;
}
export declare class CreateCoordinatesDto {
    x: number;
    y: number;
    z: number;
}
export declare class CreateMaintenanceScheduleDto {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'as_needed';
    lastMaintenance?: Date;
    nextMaintenance?: Date;
    maintenanceTasks: string[];
}
export declare class CreateCleaningScheduleDto {
    frequency: 'daily' | 'weekly' | 'monthly' | 'after_each_use' | 'as_needed';
    lastCleaning?: Date;
    nextCleaning?: Date;
    cleaningProtocol: string;
}
export declare class CreateAccessControlDto {
    requiredAccessLevel: string[];
    requiresKeyCard: boolean;
    requiresBiometric: boolean;
    accessHours: CreateAccessHoursDto[];
}
export declare class CreateAccessHoursDto {
    start: string;
    end: string;
}
export declare class CreateFacilityDto {
    venueId: string;
    facilityCode: string;
    name: string;
    facilityType: FacilityType;
    description?: string;
    location: CreateFacilityLocationDto;
    capacity: CreateFacilityCapacityDto;
    dimensions: CreateFacilityDimensionsDto;
    features: CreateFacilityFeaturesDto;
    status?: FacilityStatus;
    assignedEquipment?: string[];
    maintenanceSchedule: CreateMaintenanceScheduleDto;
    cleaningSchedule: CreateCleaningScheduleDto;
    accessControl: CreateAccessControlDto;
    metadata?: Record<string, unknown>;
    createdBy: string;
}
export declare class UpdateFacilityDto {
    name?: string;
    description?: string;
    location?: CreateFacilityLocationDto;
    capacity?: CreateFacilityCapacityDto;
    features?: CreateFacilityFeaturesDto;
    status?: FacilityStatus;
    assignedEquipment?: string[];
    maintenanceSchedule?: CreateMaintenanceScheduleDto;
    cleaningSchedule?: CreateCleaningScheduleDto;
    accessControl?: CreateAccessControlDto;
    metadata?: Record<string, unknown>;
}
export declare class FacilitySearchDto {
    search?: string;
    venueId?: string;
    facilityType?: FacilityType;
    status?: FacilityStatus;
    nearestCourt?: string;
    page?: number;
    limit?: number;
}
export declare class FacilityResponseDto {
    id: string;
    facilityCode: string;
    name: string;
    venueId: string;
    facilityType: FacilityType;
    status: FacilityStatus;
    location: CreateFacilityLocationDto;
    capacity: CreateFacilityCapacityDto;
    dimensions: CreateFacilityDimensionsDto;
    features: CreateFacilityFeaturesDto;
    assignedEquipment: string[];
    maintenanceSchedule: CreateMaintenanceScheduleDto;
    cleaningSchedule: CreateCleaningScheduleDto;
    accessControl: CreateAccessControlDto;
    utilizationMetrics: {
        totalBookings: number;
        totalHoursUsed: number;
        averageOccupancyRate: number;
        peakUsageHours: number[];
        lastUpdated: Date;
    };
    metadata: Record<string, unknown>;
    decommissionedAt?: Date;
    decommissionedReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class FacilityPaginatedResponseDto {
    data: FacilityResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
//# sourceMappingURL=facility.dto.d.ts.map