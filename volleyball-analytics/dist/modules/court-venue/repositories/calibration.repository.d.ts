import { Model, Types } from 'mongoose';
import { MongoRepository } from './base.repository';
import { ICalibrationProfile, CalibrationStatus, CalibrationMethod } from '../schemas/calibration.schema';
export declare class CalibrationRepository extends MongoRepository<ICalibrationProfile> {
    constructor(model: Model<ICalibrationProfile>);
    findByCameraInstallation(cameraInstallationId: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICalibrationProfile[]>;
    findActiveByCamera(cameraInstallationId: string): Promise<ICalibrationProfile | null>;
    findLatestByCamera(cameraInstallationId: string): Promise<ICalibrationProfile | null>;
    findByStatus(status: CalibrationStatus, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICalibrationProfile[]>;
    findByMethod(method: CalibrationMethod, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICalibrationProfile[]>;
    findValidated(): Promise<ICalibrationProfile[]>;
    findPendingValidation(): Promise<ICalibrationProfile[]>;
    findNeedingRecalibration(maxError?: number): Promise<ICalibrationProfile[]>;
    activateProfile(id: string, activatedBy: Types.ObjectId): Promise<ICalibrationProfile | null>;
    archiveProfile(id: string, archivedBy: Types.ObjectId): Promise<ICalibrationProfile | null>;
    setValidationResult(id: string, passed: boolean, details: Record<string, unknown>, validatedBy: Types.ObjectId): Promise<ICalibrationProfile | null>;
    updateMetrics(id: string, metrics: Partial<ICalibrationProfile['metrics']>): Promise<ICalibrationProfile | null>;
    updateAIProfile(id: string, aiMetadata: Partial<ICalibrationProfile['aiMetadata']>): Promise<ICalibrationProfile | null>;
    getCalibrationStats(): Promise<any>;
}
//# sourceMappingURL=calibration.repository.d.ts.map