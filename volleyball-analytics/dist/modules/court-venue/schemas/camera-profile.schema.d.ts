import { Schema, Types, Document } from 'mongoose';
export declare enum CameraProfileType {
    STANDARD = "standard",
    HIGH_SPEED = "high_speed",
    LOW_LIGHT = "low_light",
    WIDE_ANGLE = "wide_angle",
    ZOOM = "zoom",
    THERMAL = "thermal",
    STEREO = "stereo",
    CUSTOM = "custom"
}
export interface ICameraProfile extends Document {
    profileCode: string;
    name: string;
    profileType: CameraProfileType;
    description?: string;
    manufacturer?: string;
    model?: string;
    specifications: {
        resolution: {
            width: number;
            height: number;
        };
        frameRateRange: {
            min: number;
            max: number;
        };
        bitrateRange: {
            min: number;
            max: number;
        };
        supportedCodecs: string[];
        supportedProtocols: string[];
        sensorType?: string;
        sensorSize?: string;
        focalLengthRange?: {
            min: number;
            max: number;
        };
        apertureRange?: {
            min: number;
            max: number;
        };
        isoRange?: {
            min: number;
            max: number;
        };
        shutterSpeedRange?: {
            min: string;
            max: string;
        };
        whiteBalanceModes?: string[];
        focusModes?: string[];
    };
    aiConfiguration: {
        detectionModel?: string;
        trackingModel?: string;
        poseModel?: string;
        actionRecognitionModel?: string;
        ballTrackingModel?: string;
        jerseyDetectionModel?: string;
        inferenceDevice?: 'cpu' | 'gpu' | 'tpu' | 'npu';
        batchSize?: number;
        confidenceThreshold?: number;
        nmsThreshold?: number;
        customConfig?: Record<string, unknown>;
    };
    defaultSettings: {
        resolution: {
            width: number;
            height: number;
        };
        frameRate: number;
        bitrate: number;
        codec: string;
        protocol: string;
        exposure?: string;
        whiteBalance?: string;
        focusMode?: string;
        gain?: number;
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sharpness?: number;
    };
    calibrationRequirements: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiresGroundTruth: boolean;
        supportedPatterns: string[];
    };
    isActive: boolean;
    isDefault: boolean;
    version: number;
    metadata: Record<string, unknown>;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CameraProfileSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    collection: string;
}, {
    metadata: any;
    name: string;
    version: number;
    createdBy: Types.ObjectId;
    profileCode: string;
    profileType: CameraProfileType;
    isActive: boolean;
    isDefault: boolean;
    model?: string;
    description?: string;
    aiConfiguration?: {
        batchSize?: number;
        detectionModel?: string;
        trackingModel?: string;
        poseModel?: string;
        actionRecognitionModel?: string;
        ballTrackingModel?: string;
        jerseyDetectionModel?: string;
        inferenceDevice?: "cpu" | "gpu" | "tpu" | "npu";
        confidenceThreshold?: number;
        nmsThreshold?: number;
        customConfig?: any;
    };
    manufacturer?: string;
    specifications?: {
        supportedCodecs: string[];
        supportedProtocols: string[];
        whiteBalanceModes: string[];
        focusModes: string[];
        resolution?: {
            width: number;
            height: number;
        };
        sensorType?: string;
        sensorSize?: string;
        isoRange?: {
            min?: number;
            max?: number;
        };
        shutterSpeedRange?: {
            min?: string;
            max?: string;
        };
        frameRateRange?: {
            min: number;
            max: number;
        };
        bitrateRange?: {
            min: number;
            max: number;
        };
        focalLengthRange?: {
            min?: number;
            max?: number;
        };
        apertureRange?: {
            min?: number;
            max?: number;
        };
    };
    calibrationRequirements?: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiresGroundTruth: boolean;
        supportedPatterns: string[];
    };
    defaultSettings?: {
        frameRate: number;
        bitrate: number;
        codec: string;
        protocol: string;
        resolution?: {
            width: number;
            height: number;
        };
        whiteBalance?: string;
        focusMode?: string;
        exposure?: string;
        gain?: number;
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sharpness?: number;
    };
} & import("mongoose").DefaultTimestampProps, Document<unknown, {}, import("mongoose").FlatRecord<{
    metadata: any;
    name: string;
    version: number;
    createdBy: Types.ObjectId;
    profileCode: string;
    profileType: CameraProfileType;
    isActive: boolean;
    isDefault: boolean;
    model?: string;
    description?: string;
    aiConfiguration?: {
        batchSize?: number;
        detectionModel?: string;
        trackingModel?: string;
        poseModel?: string;
        actionRecognitionModel?: string;
        ballTrackingModel?: string;
        jerseyDetectionModel?: string;
        inferenceDevice?: "cpu" | "gpu" | "tpu" | "npu";
        confidenceThreshold?: number;
        nmsThreshold?: number;
        customConfig?: any;
    };
    manufacturer?: string;
    specifications?: {
        supportedCodecs: string[];
        supportedProtocols: string[];
        whiteBalanceModes: string[];
        focusModes: string[];
        resolution?: {
            width: number;
            height: number;
        };
        sensorType?: string;
        sensorSize?: string;
        isoRange?: {
            min?: number;
            max?: number;
        };
        shutterSpeedRange?: {
            min?: string;
            max?: string;
        };
        frameRateRange?: {
            min: number;
            max: number;
        };
        bitrateRange?: {
            min: number;
            max: number;
        };
        focalLengthRange?: {
            min?: number;
            max?: number;
        };
        apertureRange?: {
            min?: number;
            max?: number;
        };
    };
    calibrationRequirements?: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiresGroundTruth: boolean;
        supportedPatterns: string[];
    };
    defaultSettings?: {
        frameRate: number;
        bitrate: number;
        codec: string;
        protocol: string;
        resolution?: {
            width: number;
            height: number;
        };
        whiteBalance?: string;
        focusMode?: string;
        exposure?: string;
        gain?: number;
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sharpness?: number;
    };
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
    collection: string;
}>> & import("mongoose").FlatRecord<{
    metadata: any;
    name: string;
    version: number;
    createdBy: Types.ObjectId;
    profileCode: string;
    profileType: CameraProfileType;
    isActive: boolean;
    isDefault: boolean;
    model?: string;
    description?: string;
    aiConfiguration?: {
        batchSize?: number;
        detectionModel?: string;
        trackingModel?: string;
        poseModel?: string;
        actionRecognitionModel?: string;
        ballTrackingModel?: string;
        jerseyDetectionModel?: string;
        inferenceDevice?: "cpu" | "gpu" | "tpu" | "npu";
        confidenceThreshold?: number;
        nmsThreshold?: number;
        customConfig?: any;
    };
    manufacturer?: string;
    specifications?: {
        supportedCodecs: string[];
        supportedProtocols: string[];
        whiteBalanceModes: string[];
        focusModes: string[];
        resolution?: {
            width: number;
            height: number;
        };
        sensorType?: string;
        sensorSize?: string;
        isoRange?: {
            min?: number;
            max?: number;
        };
        shutterSpeedRange?: {
            min?: string;
            max?: string;
        };
        frameRateRange?: {
            min: number;
            max: number;
        };
        bitrateRange?: {
            min: number;
            max: number;
        };
        focalLengthRange?: {
            min?: number;
            max?: number;
        };
        apertureRange?: {
            min?: number;
            max?: number;
        };
    };
    calibrationRequirements?: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiresGroundTruth: boolean;
        supportedPatterns: string[];
    };
    defaultSettings?: {
        frameRate: number;
        bitrate: number;
        codec: string;
        protocol: string;
        resolution?: {
            width: number;
            height: number;
        };
        whiteBalance?: string;
        focusMode?: string;
        exposure?: string;
        gain?: number;
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sharpness?: number;
    };
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const CameraProfile: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<{
    metadata: any;
    name: string;
    version: number;
    createdBy: Types.ObjectId;
    profileCode: string;
    profileType: CameraProfileType;
    isActive: boolean;
    isDefault: boolean;
    model?: string;
    description?: string;
    aiConfiguration?: {
        batchSize?: number;
        detectionModel?: string;
        trackingModel?: string;
        poseModel?: string;
        actionRecognitionModel?: string;
        ballTrackingModel?: string;
        jerseyDetectionModel?: string;
        inferenceDevice?: "cpu" | "gpu" | "tpu" | "npu";
        confidenceThreshold?: number;
        nmsThreshold?: number;
        customConfig?: any;
    };
    manufacturer?: string;
    specifications?: {
        supportedCodecs: string[];
        supportedProtocols: string[];
        whiteBalanceModes: string[];
        focusModes: string[];
        resolution?: {
            width: number;
            height: number;
        };
        sensorType?: string;
        sensorSize?: string;
        isoRange?: {
            min?: number;
            max?: number;
        };
        shutterSpeedRange?: {
            min?: string;
            max?: string;
        };
        frameRateRange?: {
            min: number;
            max: number;
        };
        bitrateRange?: {
            min: number;
            max: number;
        };
        focalLengthRange?: {
            min?: number;
            max?: number;
        };
        apertureRange?: {
            min?: number;
            max?: number;
        };
    };
    calibrationRequirements?: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiresGroundTruth: boolean;
        supportedPatterns: string[];
    };
    defaultSettings?: {
        frameRate: number;
        bitrate: number;
        codec: string;
        protocol: string;
        resolution?: {
            width: number;
            height: number;
        };
        whiteBalance?: string;
        focusMode?: string;
        exposure?: string;
        gain?: number;
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sharpness?: number;
    };
} & import("mongoose").DefaultTimestampProps, {}, {}, {}, Document<unknown, {}, {
    metadata: any;
    name: string;
    version: number;
    createdBy: Types.ObjectId;
    profileCode: string;
    profileType: CameraProfileType;
    isActive: boolean;
    isDefault: boolean;
    model?: string;
    description?: string;
    aiConfiguration?: {
        batchSize?: number;
        detectionModel?: string;
        trackingModel?: string;
        poseModel?: string;
        actionRecognitionModel?: string;
        ballTrackingModel?: string;
        jerseyDetectionModel?: string;
        inferenceDevice?: "cpu" | "gpu" | "tpu" | "npu";
        confidenceThreshold?: number;
        nmsThreshold?: number;
        customConfig?: any;
    };
    manufacturer?: string;
    specifications?: {
        supportedCodecs: string[];
        supportedProtocols: string[];
        whiteBalanceModes: string[];
        focusModes: string[];
        resolution?: {
            width: number;
            height: number;
        };
        sensorType?: string;
        sensorSize?: string;
        isoRange?: {
            min?: number;
            max?: number;
        };
        shutterSpeedRange?: {
            min?: string;
            max?: string;
        };
        frameRateRange?: {
            min: number;
            max: number;
        };
        bitrateRange?: {
            min: number;
            max: number;
        };
        focalLengthRange?: {
            min?: number;
            max?: number;
        };
        apertureRange?: {
            min?: number;
            max?: number;
        };
    };
    calibrationRequirements?: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiresGroundTruth: boolean;
        supportedPatterns: string[];
    };
    defaultSettings?: {
        frameRate: number;
        bitrate: number;
        codec: string;
        protocol: string;
        resolution?: {
            width: number;
            height: number;
        };
        whiteBalance?: string;
        focusMode?: string;
        exposure?: string;
        gain?: number;
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sharpness?: number;
    };
} & import("mongoose").DefaultTimestampProps, {}, {
    timestamps: true;
    collection: string;
}> & {
    metadata: any;
    name: string;
    version: number;
    createdBy: Types.ObjectId;
    profileCode: string;
    profileType: CameraProfileType;
    isActive: boolean;
    isDefault: boolean;
    model?: string;
    description?: string;
    aiConfiguration?: {
        batchSize?: number;
        detectionModel?: string;
        trackingModel?: string;
        poseModel?: string;
        actionRecognitionModel?: string;
        ballTrackingModel?: string;
        jerseyDetectionModel?: string;
        inferenceDevice?: "cpu" | "gpu" | "tpu" | "npu";
        confidenceThreshold?: number;
        nmsThreshold?: number;
        customConfig?: any;
    };
    manufacturer?: string;
    specifications?: {
        supportedCodecs: string[];
        supportedProtocols: string[];
        whiteBalanceModes: string[];
        focusModes: string[];
        resolution?: {
            width: number;
            height: number;
        };
        sensorType?: string;
        sensorSize?: string;
        isoRange?: {
            min?: number;
            max?: number;
        };
        shutterSpeedRange?: {
            min?: string;
            max?: string;
        };
        frameRateRange?: {
            min: number;
            max: number;
        };
        bitrateRange?: {
            min: number;
            max: number;
        };
        focalLengthRange?: {
            min?: number;
            max?: number;
        };
        apertureRange?: {
            min?: number;
            max?: number;
        };
    };
    calibrationRequirements?: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiresGroundTruth: boolean;
        supportedPatterns: string[];
    };
    defaultSettings?: {
        frameRate: number;
        bitrate: number;
        codec: string;
        protocol: string;
        resolution?: {
            width: number;
            height: number;
        };
        whiteBalance?: string;
        focusMode?: string;
        exposure?: string;
        gain?: number;
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sharpness?: number;
    };
} & import("mongoose").DefaultTimestampProps & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    collection: string;
}, {
    metadata: any;
    name: string;
    version: number;
    createdBy: Types.ObjectId;
    profileCode: string;
    profileType: CameraProfileType;
    isActive: boolean;
    isDefault: boolean;
    model?: string;
    description?: string;
    aiConfiguration?: {
        batchSize?: number;
        detectionModel?: string;
        trackingModel?: string;
        poseModel?: string;
        actionRecognitionModel?: string;
        ballTrackingModel?: string;
        jerseyDetectionModel?: string;
        inferenceDevice?: "cpu" | "gpu" | "tpu" | "npu";
        confidenceThreshold?: number;
        nmsThreshold?: number;
        customConfig?: any;
    };
    manufacturer?: string;
    specifications?: {
        supportedCodecs: string[];
        supportedProtocols: string[];
        whiteBalanceModes: string[];
        focusModes: string[];
        resolution?: {
            width: number;
            height: number;
        };
        sensorType?: string;
        sensorSize?: string;
        isoRange?: {
            min?: number;
            max?: number;
        };
        shutterSpeedRange?: {
            min?: string;
            max?: string;
        };
        frameRateRange?: {
            min: number;
            max: number;
        };
        bitrateRange?: {
            min: number;
            max: number;
        };
        focalLengthRange?: {
            min?: number;
            max?: number;
        };
        apertureRange?: {
            min?: number;
            max?: number;
        };
    };
    calibrationRequirements?: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiresGroundTruth: boolean;
        supportedPatterns: string[];
    };
    defaultSettings?: {
        frameRate: number;
        bitrate: number;
        codec: string;
        protocol: string;
        resolution?: {
            width: number;
            height: number;
        };
        whiteBalance?: string;
        focusMode?: string;
        exposure?: string;
        gain?: number;
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sharpness?: number;
    };
} & import("mongoose").DefaultTimestampProps, Document<unknown, {}, import("mongoose").FlatRecord<{
    metadata: any;
    name: string;
    version: number;
    createdBy: Types.ObjectId;
    profileCode: string;
    profileType: CameraProfileType;
    isActive: boolean;
    isDefault: boolean;
    model?: string;
    description?: string;
    aiConfiguration?: {
        batchSize?: number;
        detectionModel?: string;
        trackingModel?: string;
        poseModel?: string;
        actionRecognitionModel?: string;
        ballTrackingModel?: string;
        jerseyDetectionModel?: string;
        inferenceDevice?: "cpu" | "gpu" | "tpu" | "npu";
        confidenceThreshold?: number;
        nmsThreshold?: number;
        customConfig?: any;
    };
    manufacturer?: string;
    specifications?: {
        supportedCodecs: string[];
        supportedProtocols: string[];
        whiteBalanceModes: string[];
        focusModes: string[];
        resolution?: {
            width: number;
            height: number;
        };
        sensorType?: string;
        sensorSize?: string;
        isoRange?: {
            min?: number;
            max?: number;
        };
        shutterSpeedRange?: {
            min?: string;
            max?: string;
        };
        frameRateRange?: {
            min: number;
            max: number;
        };
        bitrateRange?: {
            min: number;
            max: number;
        };
        focalLengthRange?: {
            min?: number;
            max?: number;
        };
        apertureRange?: {
            min?: number;
            max?: number;
        };
    };
    calibrationRequirements?: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiresGroundTruth: boolean;
        supportedPatterns: string[];
    };
    defaultSettings?: {
        frameRate: number;
        bitrate: number;
        codec: string;
        protocol: string;
        resolution?: {
            width: number;
            height: number;
        };
        whiteBalance?: string;
        focusMode?: string;
        exposure?: string;
        gain?: number;
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sharpness?: number;
    };
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
    collection: string;
}>> & import("mongoose").FlatRecord<{
    metadata: any;
    name: string;
    version: number;
    createdBy: Types.ObjectId;
    profileCode: string;
    profileType: CameraProfileType;
    isActive: boolean;
    isDefault: boolean;
    model?: string;
    description?: string;
    aiConfiguration?: {
        batchSize?: number;
        detectionModel?: string;
        trackingModel?: string;
        poseModel?: string;
        actionRecognitionModel?: string;
        ballTrackingModel?: string;
        jerseyDetectionModel?: string;
        inferenceDevice?: "cpu" | "gpu" | "tpu" | "npu";
        confidenceThreshold?: number;
        nmsThreshold?: number;
        customConfig?: any;
    };
    manufacturer?: string;
    specifications?: {
        supportedCodecs: string[];
        supportedProtocols: string[];
        whiteBalanceModes: string[];
        focusModes: string[];
        resolution?: {
            width: number;
            height: number;
        };
        sensorType?: string;
        sensorSize?: string;
        isoRange?: {
            min?: number;
            max?: number;
        };
        shutterSpeedRange?: {
            min?: string;
            max?: string;
        };
        frameRateRange?: {
            min: number;
            max: number;
        };
        bitrateRange?: {
            min: number;
            max: number;
        };
        focalLengthRange?: {
            min?: number;
            max?: number;
        };
        apertureRange?: {
            min?: number;
            max?: number;
        };
    };
    calibrationRequirements?: {
        minReferencePoints: number;
        maxReprojectionError: number;
        requiresGroundTruth: boolean;
        supportedPatterns: string[];
    };
    defaultSettings?: {
        frameRate: number;
        bitrate: number;
        codec: string;
        protocol: string;
        resolution?: {
            width: number;
            height: number;
        };
        whiteBalance?: string;
        focusMode?: string;
        exposure?: string;
        gain?: number;
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sharpness?: number;
    };
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=camera-profile.schema.d.ts.map