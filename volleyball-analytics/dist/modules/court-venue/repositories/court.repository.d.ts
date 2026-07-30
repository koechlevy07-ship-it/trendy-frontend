import { Model, Types } from 'mongoose';
import { MongoRepository } from './base.repository';
import { ICourt, CourtStatus, MaintenanceStatus } from '../schemas/court.schema';
export declare class CourtRepository extends MongoRepository<ICourt> {
    constructor(model: Model<ICourt>);
    findByCourtCode(venueId: string, courtCode: string): Promise<ICourt | null>;
    findByVenue(venueId: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICourt[]>;
    findActiveByVenue(venueId: string): Promise<ICourt[]>;
    findByType(courtType: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICourt[]>;
    findBySurfaceType(surfaceType: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICourt[]>;
    findByStatus(status: CourtStatus, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICourt[]>;
    findByCameraProfile(cameraProfileId: string): Promise<ICourt[]>;
    findByCalibrationProfile(calibrationProfileId: string): Promise<ICourt[]>;
    findAvailableCourts(venueId: string, startDate: Date, endDate: Date): Promise<ICourt[]>;
    findUnderMaintenance(): Promise<ICourt[]>;
    findOverdueMaintenance(): Promise<ICourt[]>;
    activateCourt(id: string, activatedBy: Types.ObjectId): Promise<ICourt | null>;
    setMaintenanceMode(id: string, status: MaintenanceStatus, scheduledAt?: Date, reason?: string): Promise<ICourt | null>;
    archiveCourt(id: string, archivedBy: Types.ObjectId): Promise<ICourt | null>;
    restoreCourt(id: string): Promise<ICourt | null>;
    assignCamera(id: string, cameraId: Types.ObjectId): Promise<ICourt | null>;
    unassignCamera(id: string, cameraId: Types.ObjectId): Promise<ICourt | null>;
    setCameraProfile(id: string, cameraProfileId: Types.ObjectId): Promise<ICourt | null>;
    setCalibrationProfile(id: string, calibrationProfileId: Types.ObjectId): Promise<ICourt | null>;
    updateAIConfiguration(id: string, config: Partial<ICourt['aiConfiguration']>): Promise<ICourt | null>;
    addBlockoutDate(id: string, date: Date): Promise<ICourt | null>;
    removeBlockoutDate(id: string, date: Date): Promise<ICourt | null>;
    getCourtStats(venueId: string): Promise<any>;
}
//# sourceMappingURL=court.repository.d.ts.map