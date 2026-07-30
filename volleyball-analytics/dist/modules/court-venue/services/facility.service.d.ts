import { Model } from 'mongoose';
import { IFacility, FacilityType, FacilityStatus } from '../schemas/facility.schema';
import { IEquipment } from '../schemas/equipment.schema';
export declare class FacilityService {
    private facilityModel;
    private equipmentModel;
    constructor(facilityModel: Model<IFacility>, equipmentModel: Model<IEquipment>);
    createFacility(dto: CreateFacilityDto): Promise<IFacility>;
    getFacilityById(id: string): Promise<IFacility>;
    getFacilitiesByVenue(venueId: string, page?: number, limit?: number): Promise<any>;
    updateFacility(id: string, dto: UpdateFacilityDto): Promise<IFacility>;
    updateStatus(id: string, status: FacilityStatus): Promise<IFacility>;
    assignEquipment(id: string, equipmentId: string): Promise<IFacility>;
    removeEquipment(id: string, equipmentId: string): Promise<IFacility>;
    updateUtilization(id: string, hoursUsed: number): Promise<IFacility>;
    updateMaintenanceSchedule(id: string, lastMaintenance: Date, nextMaintenance: Date): Promise<IFacility>;
    updateCleaningSchedule(id: string, lastCleaning: Date, nextCleaning: Date): Promise<IFacility>;
    getFacilityStats(venueId: string): Promise<any>;
    decommissionFacility(id: string, reason: string): Promise<IFacility>;
    private publishEvent;
}
export interface CreateFacilityDto {
    venueId: string;
    facilityCode: string;
    name: string;
    facilityType: FacilityType;
    description?: string;
    location: {
        floor: string;
        section: string;
        roomNumber: string;
        coordinates?: {
            x: number;
            y: number;
            z: number;
        };
        nearestCourt?: string;
    };
    capacity: {
        seated: number;
        standing: number;
        wheelchairAccessible: number;
        maxOccupancy: number;
    };
    dimensions: {
        length: number;
        width: number;
        height: number;
        area: number;
        volume: number;
    };
    features: {
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
    };
    maintenanceSchedule: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'as_needed';
        lastMaintenance?: Date;
        nextMaintenance?: Date;
        maintenanceTasks: string[];
    };
    cleaningSchedule: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'after_each_use' | 'as_needed';
        lastCleaning?: Date;
        nextCleaning?: Date;
        cleaningProtocol: string;
    };
    accessControl: {
        requiredAccessLevel: string[];
        requiresKeyCard: boolean;
        requiresBiometric: boolean;
        accessHours: {
            start: string;
            end: string;
        }[];
    };
    metadata?: Record<string, unknown>;
    createdBy: string;
}
export interface UpdateFacilityDto {
    name?: string;
    description?: string;
    location?: any;
    capacity?: any;
    features?: any;
    status?: FacilityStatus;
    assignedEquipment?: string[];
    maintenanceSchedule?: any;
    cleaningSchedule?: any;
    accessControl?: any;
    metadata?: Record<string, unknown>;
}
//# sourceMappingURL=facility.service.d.ts.map