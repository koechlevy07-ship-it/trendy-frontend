import { Model } from 'mongoose';
import { ICourt, MaintenanceStatus } from '../schemas/court.schema';
import { IVenue } from '../schemas/venue.schema';
import { ICamera } from '../schemas/camera.schema';
import { ICalibrationProfile } from '../schemas/calibration.schema';
import { ICoverageZone } from '../schemas/coverage-zone.schema';
export declare class CourtService {
    private courtModel;
    private venueModel;
    private cameraModel;
    private calibrationModel;
    private coverageZoneModel;
    constructor(courtModel: Model<ICourt>, venueModel: Model<IVenue>, cameraModel: Model<ICamera>, calibrationModel: Model<ICalibrationProfile>, coverageZoneModel: Model<ICoverageZone>);
    createCourt(dto: CreateCourtDto): Promise<ICourt>;
    getCourtById(id: string): Promise<ICourt>;
    updateCourt(id: string, dto: UpdateCourtDto): Promise<ICourt>;
    activateCourt(id: string, activatedBy: string): Promise<ICourt>;
    setMaintenance(id: string, dto: SetMaintenanceDto): Promise<ICourt>;
    assignCamera(id: string, cameraId: string): Promise<ICourt>;
    removeCamera(id: string, cameraId: string): Promise<ICourt>;
    getCourts(searchDto: CourtSearchDto): Promise<any>;
    getCourtsByVenue(venueId: string, page?: number, limit?: number): Promise<any>;
    archiveCourt(id: string, userId: string): Promise<ICourt>;
    restoreCourt(id: string, userId: string): Promise<ICourt>;
    deleteCourt(id: string): Promise<void>;
    getCourtStats(venueId?: string): Promise<any>;
    private publishEvent;
}
export interface CreateCourtDto {
    venueId: string;
    courtCode: string;
    courtName: string;
    courtType: string;
    surfaceType: string;
    dimensions: {
        length: number;
        width: number;
        freeZoneLength: number;
        freeZoneWidth: number;
        ceilingHeight?: number;
        netHeight: number;
        attackLineDistance: number;
        serviceZoneWidth: number;
    };
    orientation: string;
    equipment: {
        netSystem: string;
        posts: string;
        antennas: string;
        scoreboard: string;
        refereeStand: string;
        lighting: string;
        flooring: string;
    };
    aiConfiguration: {
        cameraProfileId?: string;
        calibrationProfileId?: string;
        trackingEnabled: boolean;
        actionRecognitionEnabled: boolean;
        poseEstimationEnabled: boolean;
        ballTrackingEnabled: boolean;
        jerseyDetectionEnabled: boolean;
        customModelConfig?: Record<string, unknown>;
    };
    assignedCameraIds?: string[];
    metadata?: Record<string, unknown>;
    createdBy: string;
}
export interface UpdateCourtDto {
    availability?: boolean;
    maintenanceStatus?: MaintenanceStatus;
    equipment?: any;
    cameraProfile?: string;
    calibrationProfile?: string;
    metadata?: Record<string, unknown>;
}
export interface SetMaintenanceDto {
    isUnderMaintenance: boolean;
    maintenanceStartDate?: Date;
    maintenanceEndDate?: Date;
    maintenanceReason?: string;
    scheduledMaintenance?: Date[];
}
export interface CourtSearchDto {
    search?: string;
    venueId?: string;
    courtType?: string;
    surfaceType?: string;
    status?: string;
    maintenanceStatus?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=court.service.d.ts.map