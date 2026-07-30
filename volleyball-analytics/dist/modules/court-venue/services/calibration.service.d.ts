import { Model } from 'mongoose';
import { ICalibrationProfile, CalibrationStatus, CalibrationMethod } from '../schemas/calibration.schema';
import { CameraRepository } from '../repositories/camera.repository';
export declare class CalibrationService {
    private readonly calibrationModel;
    private readonly cameraRepository;
    constructor(calibrationModel: Model<ICalibrationProfile>, cameraRepository: CameraRepository);
    createCalibration(createCalibrationDto: CreateCalibrationProfileDto, userId: string): Promise<ICalibrationProfile>;
    getCalibrations(searchDto: CalibrationProfileSearchDto): Promise<any>;
    getCalibrationById(id: string): Promise<ICalibrationProfile>;
    getActiveCalibration(cameraInstallationId: string): Promise<ICalibrationProfile | null>;
    updateCalibration(id: string, updateDto: UpdateCalibrationProfileDto, userId: string): Promise<ICalibrationProfile>;
    activateCalibration(id: string, activateDto: ActivateCalibrationDto): Promise<ICalibrationProfile>;
    validateCalibration(id: string, validateDto: ValidateCalibrationDto, userId: string): Promise<ICalibrationProfile>;
    archiveCalibration(id: string, userId: string): Promise<ICalibrationProfile>;
    updateMetrics(id: string, metrics: Partial<ICalibrationProfile['metrics']>): Promise<ICalibrationProfile>;
    updateAIProfile(id: string, aiMetadata: Partial<ICalibrationProfile['aiMetadata']>): Promise<ICalibrationProfile>;
    getCalibrationStats(): Promise<any>;
    findNeedingRecalibration(maxError?: number): Promise<ICalibrationProfile[]>;
    private publishEvent;
}
export interface CreateCalibrationProfileDto {
    cameraInstallationId: string;
    profileName: string;
    method: CalibrationMethod;
    intrinsicParameters: any;
    extrinsicParameters: any;
    referencePoints: any[];
    homographyMatrix: any;
    metrics: any;
    aiMetadata?: Record<string, unknown>;
    notes?: string;
    createdBy: string;
}
export interface UpdateCalibrationProfileDto {
    profileName?: string;
    status?: CalibrationStatus;
    intrinsicParameters?: any;
    extrinsicParameters?: any;
    referencePoints?: any[];
    homographyMatrix?: any;
    metrics?: any;
    aiMetadata?: Record<string, unknown>;
    notes?: string;
}
export declare class CalibrationProfileSearchDto {
    cameraInstallationId?: string;
    status?: CalibrationStatus;
    method?: CalibrationMethod;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class ActivateCalibrationDto {
    activatedBy: string;
}
export declare class ValidateCalibrationDto {
    passed: boolean;
    details: Record<string, unknown>;
    validatedBy: string;
}
export declare class CalibrationProfileResponseDto {
    id: string;
    cameraInstallationId: string;
    profileName: string;
    version: number;
    method: CalibrationMethod;
    status: CalibrationStatus;
    intrinsicParameters: any;
    extrinsicParameters: any;
    referencePoints: any[];
    homographyMatrix: any;
    metrics: any;
    validationResults?: {
        passed: boolean;
        details: Record<string, unknown>;
        validatedAt: Date;
        validatedBy: string;
    };
    aiMetadata: Record<string, unknown>;
    notes?: string;
    createdBy: string;
    activatedAt?: Date;
    activatedBy?: string;
    archivedAt?: Date;
    archivedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CalibrationProfilePaginatedResponseDto {
    data: CalibrationProfileResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
//# sourceMappingURL=calibration.service.d.ts.map