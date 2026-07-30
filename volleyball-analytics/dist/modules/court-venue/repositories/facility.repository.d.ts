import { Model, Types } from 'mongoose';
import { MongoRepository } from './base.repository';
import { IFacility, FacilityType, FacilityStatus } from '../schemas/facility.schema';
export declare class FacilityRepository extends MongoRepository<IFacility> {
    constructor(model: Model<IFacility>);
    findByFacilityCode(venueId: string, facilityCode: string): Promise<IFacility | null>;
    findByVenue(venueId: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<IFacility[]>;
    findByType(facilityType: FacilityType, pagination?: {
        page: number;
        limit: number;
    }): Promise<IFacility[]>;
    findByStatus(status: FacilityStatus, pagination?: {
        page: number;
        limit: number;
    }): Promise<IFacility[]>;
    findByCourt(courtId: string): Promise<IFacility[]>;
    findAvailable(venueId: string, startTime: Date, endTime: Date): Promise<IFacility[]>;
    findByFloor(venueId: string, floor: string): Promise<IFacility[]>;
    findWheelchairAccessible(venueId: string): Promise<IFacility[]>;
    findWithEquipment(venueId: string): Promise<IFacility[]>;
    updateStatus(id: string, status: FacilityStatus): Promise<IFacility | null>;
    assignEquipment(id: string, equipmentId: Types.ObjectId): Promise<IFacility | null>;
    removeEquipment(id: string, equipmentId: Types.ObjectId): Promise<IFacility | null>;
    updateUtilization(id: string, hoursUsed: number): Promise<IFacility | null>;
    updateMaintenanceSchedule(id: string, lastMaintenance: Date, nextMaintenance: Date): Promise<IFacility | null>;
    updateCleaningSchedule(id: string, lastCleaning: Date, nextCleaning: Date): Promise<IFacility | null>;
    getFacilityStats(venueId: string): Promise<any>;
}
//# sourceMappingURL=facility.repository.d.ts.map