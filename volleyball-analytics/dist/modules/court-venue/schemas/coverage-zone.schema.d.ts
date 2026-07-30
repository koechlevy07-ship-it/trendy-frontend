import { Schema, Types, Document } from 'mongoose';
export declare enum CoverageZoneType {
    PLAY_AREA = "play_area",
    FREE_ZONE = "free_zone",
    SERVICE_ZONE = "service_zone",
    SUBSTITUTION_ZONE = "substitution_zone",
    LIBERO_ZONE = "libero_zone",
    WARM_UP_AREA = "warm_up_area",
    TEAM_BENCH = "team_bench",
    OFFICIALS_TABLE = "officials_table",
    REFEREE_POSITION = "referee_position",
    LINE_JUDGE_POSITION = "line_judge_position",
    CAMERA_POSITION = "camera_position",
    SPECTATOR_AREA = "spectator_area",
    MEDIA_AREA = "media_area",
    BROADCAST_ZONE = "broadcast_zone",
    CUSTOM = "custom"
}
export declare enum CoveragePriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export interface ICoveragePolygon {
    type: 'Polygon';
    coordinates: number[][][];
}
export interface ICoveragePoint {
    type: 'Point';
    coordinates: [number, number, number?];
}
export interface ICoverageZone extends Document {
    courtId: Types.ObjectId;
    zoneCode: string;
    name: string;
    zoneType: CoverageZoneType;
    priority: CoveragePriority;
    geometry: ICoveragePolygon | ICoveragePoint;
    area?: number;
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    coverageRequirements: {
        minResolution: {
            width: number;
            height: number;
        };
        minFrameRate: number;
        maxLatencyMs: number;
        requiredFOV: {
            horizontal: number;
            vertical: number;
        };
        overlapPercentage: number;
        redundancyLevel: number;
    };
    calibrationRequirements: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiredAccuracy: number;
    };
    aiRequirements: {
        detectionRequired: boolean;
        trackingRequired: boolean;
        poseEstimationRequired: boolean;
        actionRecognitionRequired: boolean;
        ballTrackingRequired: boolean;
        jerseyDetectionRequired: boolean;
    };
    status: 'designed' | 'configured' | 'calibrated' | 'validated' | 'active' | 'degraded' | 'offline';
    coverageMetrics: {
        actualCameraCount: number;
        coveragePercentage: number;
        averageResolution: {
            width: number;
            height: number;
        };
        averageFrameRate: number;
        averageLatencyMs: number;
        overlapAchieved: number;
        redundancyAchieved: number;
        lastCalculated: Date;
    };
    validationResults?: {
        validatedAt: Date;
        validatedBy: Types.ObjectId;
        passed: boolean;
        issues: string[];
        recommendations: string[];
    };
    metadata: Record<string, unknown>;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CoverageZoneSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    collection: string;
}, {
    status: "active" | "calibrated" | "offline" | "designed" | "configured" | "validated" | "degraded";
    metadata: any;
    name: string;
    courtId: Types.ObjectId;
    createdBy: Types.ObjectId;
    zoneCode: string;
    zoneType: CoverageZoneType;
    priority: CoveragePriority;
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    coverageRequirements: {
        minFrameRate: number;
        maxLatencyMs: number;
        overlapPercentage: number;
        redundancyLevel: number;
        minResolution?: {
            width: number;
            height: number;
        };
        requiredFOV?: {
            horizontal: number;
            vertical: number;
        };
    };
    calibrationRequirements: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiredAccuracy: number;
    };
    aiRequirements: {
        detectionRequired: boolean;
        trackingRequired: boolean;
        poseEstimationRequired: boolean;
        actionRecognitionRequired: boolean;
        ballTrackingRequired: boolean;
        jerseyDetectionRequired: boolean;
    };
    coverageMetrics: {
        actualCameraCount: number;
        coveragePercentage: number;
        averageFrameRate: number;
        averageLatencyMs: number;
        overlapAchieved: number;
        redundancyAchieved: number;
        lastCalculated: NativeDate;
        averageResolution?: {
            width: number;
            height: number;
        };
    };
    validationResults?: {
        passed: boolean;
        validatedAt: NativeDate;
        validatedBy: Types.ObjectId;
        issues: string[];
        recommendations: string[];
    };
    area?: number;
    geometry?: {
        type: "Point" | "Polygon";
        coordinates: any;
    };
} & import("mongoose").DefaultTimestampProps, Document<unknown, {}, import("mongoose").FlatRecord<{
    status: "active" | "calibrated" | "offline" | "designed" | "configured" | "validated" | "degraded";
    metadata: any;
    name: string;
    courtId: Types.ObjectId;
    createdBy: Types.ObjectId;
    zoneCode: string;
    zoneType: CoverageZoneType;
    priority: CoveragePriority;
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    coverageRequirements: {
        minFrameRate: number;
        maxLatencyMs: number;
        overlapPercentage: number;
        redundancyLevel: number;
        minResolution?: {
            width: number;
            height: number;
        };
        requiredFOV?: {
            horizontal: number;
            vertical: number;
        };
    };
    calibrationRequirements: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiredAccuracy: number;
    };
    aiRequirements: {
        detectionRequired: boolean;
        trackingRequired: boolean;
        poseEstimationRequired: boolean;
        actionRecognitionRequired: boolean;
        ballTrackingRequired: boolean;
        jerseyDetectionRequired: boolean;
    };
    coverageMetrics: {
        actualCameraCount: number;
        coveragePercentage: number;
        averageFrameRate: number;
        averageLatencyMs: number;
        overlapAchieved: number;
        redundancyAchieved: number;
        lastCalculated: NativeDate;
        averageResolution?: {
            width: number;
            height: number;
        };
    };
    validationResults?: {
        passed: boolean;
        validatedAt: NativeDate;
        validatedBy: Types.ObjectId;
        issues: string[];
        recommendations: string[];
    };
    area?: number;
    geometry?: {
        type: "Point" | "Polygon";
        coordinates: any;
    };
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
    collection: string;
}>> & import("mongoose").FlatRecord<{
    status: "active" | "calibrated" | "offline" | "designed" | "configured" | "validated" | "degraded";
    metadata: any;
    name: string;
    courtId: Types.ObjectId;
    createdBy: Types.ObjectId;
    zoneCode: string;
    zoneType: CoverageZoneType;
    priority: CoveragePriority;
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    coverageRequirements: {
        minFrameRate: number;
        maxLatencyMs: number;
        overlapPercentage: number;
        redundancyLevel: number;
        minResolution?: {
            width: number;
            height: number;
        };
        requiredFOV?: {
            horizontal: number;
            vertical: number;
        };
    };
    calibrationRequirements: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiredAccuracy: number;
    };
    aiRequirements: {
        detectionRequired: boolean;
        trackingRequired: boolean;
        poseEstimationRequired: boolean;
        actionRecognitionRequired: boolean;
        ballTrackingRequired: boolean;
        jerseyDetectionRequired: boolean;
    };
    coverageMetrics: {
        actualCameraCount: number;
        coveragePercentage: number;
        averageFrameRate: number;
        averageLatencyMs: number;
        overlapAchieved: number;
        redundancyAchieved: number;
        lastCalculated: NativeDate;
        averageResolution?: {
            width: number;
            height: number;
        };
    };
    validationResults?: {
        passed: boolean;
        validatedAt: NativeDate;
        validatedBy: Types.ObjectId;
        issues: string[];
        recommendations: string[];
    };
    area?: number;
    geometry?: {
        type: "Point" | "Polygon";
        coordinates: any;
    };
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const CoverageZone: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<{
    status: "active" | "calibrated" | "offline" | "designed" | "configured" | "validated" | "degraded";
    metadata: any;
    name: string;
    courtId: Types.ObjectId;
    createdBy: Types.ObjectId;
    zoneCode: string;
    zoneType: CoverageZoneType;
    priority: CoveragePriority;
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    coverageRequirements: {
        minFrameRate: number;
        maxLatencyMs: number;
        overlapPercentage: number;
        redundancyLevel: number;
        minResolution?: {
            width: number;
            height: number;
        };
        requiredFOV?: {
            horizontal: number;
            vertical: number;
        };
    };
    calibrationRequirements: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiredAccuracy: number;
    };
    aiRequirements: {
        detectionRequired: boolean;
        trackingRequired: boolean;
        poseEstimationRequired: boolean;
        actionRecognitionRequired: boolean;
        ballTrackingRequired: boolean;
        jerseyDetectionRequired: boolean;
    };
    coverageMetrics: {
        actualCameraCount: number;
        coveragePercentage: number;
        averageFrameRate: number;
        averageLatencyMs: number;
        overlapAchieved: number;
        redundancyAchieved: number;
        lastCalculated: NativeDate;
        averageResolution?: {
            width: number;
            height: number;
        };
    };
    validationResults?: {
        passed: boolean;
        validatedAt: NativeDate;
        validatedBy: Types.ObjectId;
        issues: string[];
        recommendations: string[];
    };
    area?: number;
    geometry?: {
        type: "Point" | "Polygon";
        coordinates: any;
    };
} & import("mongoose").DefaultTimestampProps, {}, {}, {}, Document<unknown, {}, {
    status: "active" | "calibrated" | "offline" | "designed" | "configured" | "validated" | "degraded";
    metadata: any;
    name: string;
    courtId: Types.ObjectId;
    createdBy: Types.ObjectId;
    zoneCode: string;
    zoneType: CoverageZoneType;
    priority: CoveragePriority;
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    coverageRequirements: {
        minFrameRate: number;
        maxLatencyMs: number;
        overlapPercentage: number;
        redundancyLevel: number;
        minResolution?: {
            width: number;
            height: number;
        };
        requiredFOV?: {
            horizontal: number;
            vertical: number;
        };
    };
    calibrationRequirements: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiredAccuracy: number;
    };
    aiRequirements: {
        detectionRequired: boolean;
        trackingRequired: boolean;
        poseEstimationRequired: boolean;
        actionRecognitionRequired: boolean;
        ballTrackingRequired: boolean;
        jerseyDetectionRequired: boolean;
    };
    coverageMetrics: {
        actualCameraCount: number;
        coveragePercentage: number;
        averageFrameRate: number;
        averageLatencyMs: number;
        overlapAchieved: number;
        redundancyAchieved: number;
        lastCalculated: NativeDate;
        averageResolution?: {
            width: number;
            height: number;
        };
    };
    validationResults?: {
        passed: boolean;
        validatedAt: NativeDate;
        validatedBy: Types.ObjectId;
        issues: string[];
        recommendations: string[];
    };
    area?: number;
    geometry?: {
        type: "Point" | "Polygon";
        coordinates: any;
    };
} & import("mongoose").DefaultTimestampProps, {}, {
    timestamps: true;
    collection: string;
}> & {
    status: "active" | "calibrated" | "offline" | "designed" | "configured" | "validated" | "degraded";
    metadata: any;
    name: string;
    courtId: Types.ObjectId;
    createdBy: Types.ObjectId;
    zoneCode: string;
    zoneType: CoverageZoneType;
    priority: CoveragePriority;
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    coverageRequirements: {
        minFrameRate: number;
        maxLatencyMs: number;
        overlapPercentage: number;
        redundancyLevel: number;
        minResolution?: {
            width: number;
            height: number;
        };
        requiredFOV?: {
            horizontal: number;
            vertical: number;
        };
    };
    calibrationRequirements: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiredAccuracy: number;
    };
    aiRequirements: {
        detectionRequired: boolean;
        trackingRequired: boolean;
        poseEstimationRequired: boolean;
        actionRecognitionRequired: boolean;
        ballTrackingRequired: boolean;
        jerseyDetectionRequired: boolean;
    };
    coverageMetrics: {
        actualCameraCount: number;
        coveragePercentage: number;
        averageFrameRate: number;
        averageLatencyMs: number;
        overlapAchieved: number;
        redundancyAchieved: number;
        lastCalculated: NativeDate;
        averageResolution?: {
            width: number;
            height: number;
        };
    };
    validationResults?: {
        passed: boolean;
        validatedAt: NativeDate;
        validatedBy: Types.ObjectId;
        issues: string[];
        recommendations: string[];
    };
    area?: number;
    geometry?: {
        type: "Point" | "Polygon";
        coordinates: any;
    };
} & import("mongoose").DefaultTimestampProps & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    collection: string;
}, {
    status: "active" | "calibrated" | "offline" | "designed" | "configured" | "validated" | "degraded";
    metadata: any;
    name: string;
    courtId: Types.ObjectId;
    createdBy: Types.ObjectId;
    zoneCode: string;
    zoneType: CoverageZoneType;
    priority: CoveragePriority;
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    coverageRequirements: {
        minFrameRate: number;
        maxLatencyMs: number;
        overlapPercentage: number;
        redundancyLevel: number;
        minResolution?: {
            width: number;
            height: number;
        };
        requiredFOV?: {
            horizontal: number;
            vertical: number;
        };
    };
    calibrationRequirements: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiredAccuracy: number;
    };
    aiRequirements: {
        detectionRequired: boolean;
        trackingRequired: boolean;
        poseEstimationRequired: boolean;
        actionRecognitionRequired: boolean;
        ballTrackingRequired: boolean;
        jerseyDetectionRequired: boolean;
    };
    coverageMetrics: {
        actualCameraCount: number;
        coveragePercentage: number;
        averageFrameRate: number;
        averageLatencyMs: number;
        overlapAchieved: number;
        redundancyAchieved: number;
        lastCalculated: NativeDate;
        averageResolution?: {
            width: number;
            height: number;
        };
    };
    validationResults?: {
        passed: boolean;
        validatedAt: NativeDate;
        validatedBy: Types.ObjectId;
        issues: string[];
        recommendations: string[];
    };
    area?: number;
    geometry?: {
        type: "Point" | "Polygon";
        coordinates: any;
    };
} & import("mongoose").DefaultTimestampProps, Document<unknown, {}, import("mongoose").FlatRecord<{
    status: "active" | "calibrated" | "offline" | "designed" | "configured" | "validated" | "degraded";
    metadata: any;
    name: string;
    courtId: Types.ObjectId;
    createdBy: Types.ObjectId;
    zoneCode: string;
    zoneType: CoverageZoneType;
    priority: CoveragePriority;
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    coverageRequirements: {
        minFrameRate: number;
        maxLatencyMs: number;
        overlapPercentage: number;
        redundancyLevel: number;
        minResolution?: {
            width: number;
            height: number;
        };
        requiredFOV?: {
            horizontal: number;
            vertical: number;
        };
    };
    calibrationRequirements: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiredAccuracy: number;
    };
    aiRequirements: {
        detectionRequired: boolean;
        trackingRequired: boolean;
        poseEstimationRequired: boolean;
        actionRecognitionRequired: boolean;
        ballTrackingRequired: boolean;
        jerseyDetectionRequired: boolean;
    };
    coverageMetrics: {
        actualCameraCount: number;
        coveragePercentage: number;
        averageFrameRate: number;
        averageLatencyMs: number;
        overlapAchieved: number;
        redundancyAchieved: number;
        lastCalculated: NativeDate;
        averageResolution?: {
            width: number;
            height: number;
        };
    };
    validationResults?: {
        passed: boolean;
        validatedAt: NativeDate;
        validatedBy: Types.ObjectId;
        issues: string[];
        recommendations: string[];
    };
    area?: number;
    geometry?: {
        type: "Point" | "Polygon";
        coordinates: any;
    };
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
    collection: string;
}>> & import("mongoose").FlatRecord<{
    status: "active" | "calibrated" | "offline" | "designed" | "configured" | "validated" | "degraded";
    metadata: any;
    name: string;
    courtId: Types.ObjectId;
    createdBy: Types.ObjectId;
    zoneCode: string;
    zoneType: CoverageZoneType;
    priority: CoveragePriority;
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    coverageRequirements: {
        minFrameRate: number;
        maxLatencyMs: number;
        overlapPercentage: number;
        redundancyLevel: number;
        minResolution?: {
            width: number;
            height: number;
        };
        requiredFOV?: {
            horizontal: number;
            vertical: number;
        };
    };
    calibrationRequirements: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiredAccuracy: number;
    };
    aiRequirements: {
        detectionRequired: boolean;
        trackingRequired: boolean;
        poseEstimationRequired: boolean;
        actionRecognitionRequired: boolean;
        ballTrackingRequired: boolean;
        jerseyDetectionRequired: boolean;
    };
    coverageMetrics: {
        actualCameraCount: number;
        coveragePercentage: number;
        averageFrameRate: number;
        averageLatencyMs: number;
        overlapAchieved: number;
        redundancyAchieved: number;
        lastCalculated: NativeDate;
        averageResolution?: {
            width: number;
            height: number;
        };
    };
    validationResults?: {
        passed: boolean;
        validatedAt: NativeDate;
        validatedBy: Types.ObjectId;
        issues: string[];
        recommendations: string[];
    };
    area?: number;
    geometry?: {
        type: "Point" | "Polygon";
        coordinates: any;
    };
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=coverage-zone.schema.d.ts.map