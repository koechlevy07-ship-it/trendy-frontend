"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraProfile = exports.CameraProfileSchema = exports.CameraProfileType = void 0;
const mongoose_1 = require("mongoose");
var CameraProfileType;
(function (CameraProfileType) {
    CameraProfileType["STANDARD"] = "standard";
    CameraProfileType["HIGH_SPEED"] = "high_speed";
    CameraProfileType["LOW_LIGHT"] = "low_light";
    CameraProfileType["WIDE_ANGLE"] = "wide_angle";
    CameraProfileType["ZOOM"] = "zoom";
    CameraProfileType["THERMAL"] = "thermal";
    CameraProfileType["STEREO"] = "stereo";
    CameraProfileType["CUSTOM"] = "custom";
})(CameraProfileType || (exports.CameraProfileType = CameraProfileType = {}));
const CameraProfileSchema = new mongoose_1.Schema({
    profileCode: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    profileType: { type: String, enum: Object.values(CameraProfileType), required: true },
    description: { type: String, trim: true, maxlength: 1000 },
    manufacturer: { type: String, trim: true, maxlength: 100 }, model: { type: String, trim: true, maxlength: 100 },
    specifications: {
        resolution: { width: { type: Number, required: true, min: 320 }, height: { type: Number, required: true, min: 240 } },
        frameRateRange: { min: { type: Number, required: true, min: 1 }, max: { type: Number, required: true, min: 1 } },
        bitrateRange: { min: { type: Number, required: true, min: 1000 }, max: { type: Number, required: true, min: 1000 } },
        supportedCodecs: [{ type: String, trim: true }], supportedProtocols: [{ type: String, trim: true }],
        sensorType: { type: String, trim: true }, sensorSize: { type: String, trim: true },
        focalLengthRange: { min: { type: Number }, max: { type: Number } },
        apertureRange: { min: { type: Number }, max: { type: Number } },
        isoRange: { min: { type: Number }, max: { type: Number } },
        shutterSpeedRange: { min: { type: String }, max: { type: String } },
        whiteBalanceModes: [{ type: String }], focusModes: [{ type: String }],
    },
    aiConfiguration: {
        detectionModel: { type: String }, trackingModel: { type: String }, poseModel: { type: String },
        actionRecognitionModel: { type: String }, ballTrackingModel: { type: String },
        jerseyDetectionModel: { type: String },
        inferenceDevice: { type: String, enum: ['cpu', 'gpu', 'tpu', 'npu'] },
        batchSize: { type: Number, min: 1 }, confidenceThreshold: { type: Number, min: 0, max: 1 },
        nmsThreshold: { type: Number, min: 0, max: 1 }, customConfig: { type: mongoose_1.Schema.Types.Mixed },
    },
    defaultSettings: {
        resolution: { width: { type: Number, required: true }, height: { type: Number, required: true } },
        frameRate: { type: Number, required: true }, bitrate: { type: Number, required: true },
        codec: { type: String, required: true }, protocol: { type: String, required: true },
        exposure: { type: String }, whiteBalance: { type: String }, focusMode: { type: String },
        gain: { type: Number }, brightness: { type: Number }, contrast: { type: Number },
        saturation: { type: Number }, sharpness: { type: Number },
    },
    calibrationRequirements: { minReferencePoints: { type: Number, default: 4, min: 4 }, maxReprojectionError: { type: Number, default: 1.0, min: 0.1 }, requiresGroundTruth: { type: Boolean, default: false }, supportedPatterns: [{ type: String }] },
    isActive: { type: Boolean, default: true }, isDefault: { type: Boolean, default: false }, version: { type: Number, default: 1, min: 1 },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} }, createdBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true, collection: 'camera_profiles' });
CameraProfileSchema.index({ profileType: 1, isActive: 1 });
CameraProfileSchema.index({ isDefault: 1 });
CameraProfileSchema.index({ manufacturer: 1, model: 1 });
CameraProfileSchema.pre('save', function (next) { if (this.isDefault)
    this.constructor.updateMany({ isDefault: true, _id: { $ne: this._id } }, { isDefault: false }).exec(); next(); });
exports.CameraProfileSchema = CameraProfileSchema;
exports.CameraProfile = mongoose_1.models.CameraProfile || (0, mongoose_1.model)('CameraProfile', CameraProfileSchema);
//# sourceMappingURL=camera-profile.schema.js.map