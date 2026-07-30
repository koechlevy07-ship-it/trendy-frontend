import { CalibrationStatus, CalibrationMethod } from '../schemas/calibration.schema';
export declare class CreateIntrinsicParametersDto {
    focalLengthX: number;
    focalLengthY: number;
    principalPointX: number;
    principalPointY: number;
    skew: number;
    distortionCoefficients: number[];
}
export declare class CreateExtrinsicParametersDto {
    rotationMatrix: number[][];
    translationVector: number[];
    cameraHeight: number;
    cameraTilt: number;
    cameraPan: number;
    cameraRoll: number;
}
export declare class CreateReferencePointDto {
    id: string;
    name: string;
    worldCoordinates: CreateWorldCoordinatesDto;
    imageCoordinates: CreateImageCoordinatesDto;
    confidence: number;
}
export declare class CreateWorldCoordinatesDto {
    x: number;
    y: number;
    z: number;
}
export declare class CreateImageCoordinatesDto {
    x: number;
    y: number;
}
export declare class CreateHomographyMatrixDto {
    matrix: number[][];
    sourcePoints: CreateImageCoordinatesDto[];
    destinationPoints: CreateImageCoordinatesDto[];
}
export declare class CreateCalibrationMetricsDto {
    reprojectionError: number;
    rmsError: number;
    maxError: number;
    standardDeviation: number;
    pointCount: number;
    validPointCount: number;
}
export declare class CreateCalibrationProfileDto {
    cameraInstallationId: string;
    profileName: string;
    method: CalibrationMethod;
    intrinsicParameters: CreateIntrinsicParametersDto;
    extrinsicParameters: CreateExtrinsicParametersDto;
    referencePoints: CreateReferencePointDto[];
    homographyMatrix: CreateHomographyMatrixDto;
    metrics: CreateCalibrationMetricsDto;
    aiMetadata?: Record<string, unknown>;
    notes?: string;
    createdBy: string;
}
export declare class UpdateCalibrationProfileDto {
    profileName?: string;
    status?: CalibrationStatus;
    intrinsicParameters?: CreateIntrinsicParametersDto;
    extrinsicParameters?: CreateExtrinsicParametersDto;
    referencePoints?: CreateReferencePointDto[];
    homographyMatrix?: CreateHomographyMatrixDto;
    metrics?: CreateCalibrationMetricsDto;
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
    intrinsicParameters: CreateIntrinsicParametersDto;
    extrinsicParameters: CreateExtrinsicParametersDto;
    referencePoints: CreateReferencePointDto[];
    homographyMatrix: CreateHomographyMatrixDto;
    metrics: CreateCalibrationMetricsDto;
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
//# sourceMappingURL=calibration.dto.d.ts.map