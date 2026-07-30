import { Model, Types } from 'mongoose';
import { MongoRepository } from './base.repository';
import { ICamera, CameraStatus, CameraMountType, CameraManufacturer } from '../schemas/camera.schema';
export declare class CameraRepository extends MongoRepository<ICamera> {
    constructor(model: Model<ICamera>);
    findByCameraId(cameraId: string): Promise<ICamera | null>;
    findByCourt(courtId: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICamera[]>;
    findActiveByCourt(courtId: string): Promise<ICamera[]>;
    findBySerialNumber(serialNumber: string): Promise<ICamera | null>;
    findByStatus(status: CameraStatus, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICamera[]>;
    findByMountType(mountType: CameraMountType, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICamera[]>;
    findByManufacturer(manufacturer: CameraManufacturer, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICamera[]>;
    findByCalibrationProfile(calibrationProfileId: string): Promise<ICamera[]>;
    findUncalibrated(): Promise<ICamera[]>;
    findWithErrors(): Promise<ICamera[]>;
    findNeedingMaintenance(): Promise<ICamera[]>;
    updateHeartbeat(id: string): Promise<ICamera | null>;
    updateStatus(id: string, status: CameraStatus, errorMessage?: string): Promise<ICamera | null>;
    assignCalibrationProfile(id: string, calibrationProfileId: Types.ObjectId): Promise<ICamera | null>;
    assignCoverageZone(id: string, coverageZoneId: Types.ObjectId): Promise<ICamera | null>;
    removeCoverageZone(id: string, coverageZoneId: Types.ObjectId): Promise<ICamera | null>;
    updatePosition(id: string, position: ICamera['position']): Promise<ICamera | null>;
    updateStreamConfig(id: string, streamConfig: ICamera['streamConfig']): Promise<ICamera | null>;
    updateHealthMetrics(id: string, metrics: Partial<ICamera['healthMetrics']>): Promise<ICamera | null>;
    recordError(id: string, error: string): Promise<ICamera | null>;
    getCameraStats(courtId: string): Promise<any>;
}
//# sourceMappingURL=camera.repository.d.ts.map