import { Types, HydratedDocument, Document } from 'mongoose';
export declare enum CalibrationStatus {
    DRAFT = "draft",
    PENDING_VALIDATION = "pending_validation",
    ACTIVE = "active",
    ARCHIVED = "archived",
    FAILED = "failed"
}
export declare enum CalibrationMethod {
    CHECKERBOARD = "checkerboard",
    CHARUCO = "charuco",
    ARUCO = "aruco",
    GRID = "grid",
    MANUAL = "manual",
    AUTO = "auto",
    HYBRID = "hybrid"
}
export interface IIntrinsicParameters {
    focalLengthX: number;
    focalLengthY: number;
    principalPointX: number;
    principalPointY: number;
    skew: number;
    distortionCoefficients: number[];
}
export interface IExtrinsicParameters {
    rotationMatrix: number[][];
    translationVector: number[];
    cameraHeight: number;
    cameraTilt: number;
    cameraPan: number;
    cameraRoll: number;
}
export interface IReferencePoint {
    id: string;
    name: string;
    worldCoordinates: {
        x: number;
        y: number;
        z: number;
    };
    imageCoordinates: {
        x: number;
        y: number;
    };
    confidence: number;
}
export interface IHomographyMatrix {
    matrix: number[][];
    sourcePoints: {
        x: number;
        y: number;
    }[];
    destinationPoints: {
        x: number;
        y: number;
    }[];
}
export interface ICalibrationMetrics {
    reprojectionError: number;
    rmsError: number;
    maxError: number;
    standardDeviation: number;
    pointCount: number;
    validPointCount: number;
}
export interface ICalibrationProfile extends Document {
    cameraInstallationId: Types.ObjectId;
    profileName: string;
    version: number;
    method: CalibrationMethod;
    status: CalibrationStatus;
    intrinsicParameters: IIntrinsicParameters;
    extrinsicParameters: IExtrinsicParameters;
    referencePoints: IReferencePoint[];
    homographyMatrix: IHomographyMatrix;
    metrics: ICalibrationMetrics;
    validationResults?: {
        passed: boolean;
        details: Record<string, unknown>;
        validatedAt: Date;
        validatedBy: Types.ObjectId;
    };
    aiMetadata: {
        modelVersion?: string;
        trainingDataHash?: string;
        featureExtractionConfig?: Record<string, unknown>;
        inferenceThreshold?: number;
    };
    notes?: string;
    createdBy: Types.ObjectId;
    activatedAt?: Date;
    activatedBy?: Types.ObjectId;
    archivedAt?: Date;
    archivedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export type CalibrationProfileDocument = HydratedDocument<ICalibrationProfile>;
export declare const CalibrationProfile: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<ICalibrationProfile, {}, {}, {}, Document<unknown, {}, ICalibrationProfile, {}, {}> & ICalibrationProfile & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=calibration.schema.d.ts.map