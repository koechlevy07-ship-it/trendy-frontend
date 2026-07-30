"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalibrationProfile = exports.CalibrationMethod = exports.CalibrationStatus = void 0;
const mongoose_1 = require("mongoose");
var CalibrationStatus;
(function (CalibrationStatus) {
    CalibrationStatus["DRAFT"] = "draft";
    CalibrationStatus["PENDING_VALIDATION"] = "pending_validation";
    CalibrationStatus["ACTIVE"] = "active";
    CalibrationStatus["ARCHIVED"] = "archived";
    CalibrationStatus["FAILED"] = "failed";
})(CalibrationStatus || (exports.CalibrationStatus = CalibrationStatus = {}));
var CalibrationMethod;
(function (CalibrationMethod) {
    CalibrationMethod["CHECKERBOARD"] = "checkerboard";
    CalibrationMethod["CHARUCO"] = "charuco";
    CalibrationMethod["ARUCO"] = "aruco";
    CalibrationMethod["GRID"] = "grid";
    CalibrationMethod["MANUAL"] = "manual";
    CalibrationMethod["AUTO"] = "auto";
    CalibrationMethod["HYBRID"] = "hybrid";
})(CalibrationMethod || (exports.CalibrationMethod = CalibrationMethod = {}));
const IntrinsicParametersSchema = new mongoose_1.Schema({ focalLengthX: { type: Number, required: true }, focalLengthY: { type: Number, required: true }, principalPointX: { type: Number, required: true }, principalPointY: { type: Number, required: true }, skew: { type: Number, default: 0 }, distortionCoefficients: { type: [Number], required: true, default: [] } }, { _id: false });
const ExtrinsicParametersSchema = new mongoose_1.Schema({ rotationMatrix: { type: [[Number]], required: true }, translationVector: { type: [Number], required: true }, cameraHeight: { type: Number, required: true }, cameraTilt: { type: Number, required: true }, cameraPan: { type: Number, required: true }, cameraRoll: { type: Number, required: true } }, { _id: false });
const ReferencePointSchema = new mongoose_1.Schema({ id: { type: String, required: true }, name: { type: String, required: true, trim: true }, worldCoordinates: { x: { type: Number, required: true }, y: { type: Number, required: true }, z: { type: Number, required: true } }, imageCoordinates: { x: { type: Number, required: true }, y: { type: Number, required: true } }, confidence: { type: Number, required: true, min: 0, max: 1 } }, { _id: false });
const HomographyMatrixSchema = new mongoose_1.Schema({ matrix: { type: [[Number]], required: true }, sourcePoints: { type: [{ x: Number, y: Number }], required: true }, destinationPoints: { type: [{ x: Number, y: Number }], required: true } }, { _id: false });
const CalibrationMetricsSchema = new mongoose_1.Schema({ reprojectionError: { type: Number, required: true, min: 0 }, rmsError: { type: Number, required: true, min: 0 }, maxError: { type: Number, required: true, min: 0 }, standardDeviation: { type: Number, required: true, min: 0 }, pointCount: { type: Number, required: true, min: 4 }, validPointCount: { type: Number, required: true, min: 4 } }, { _id: false });
const CalibrationProfileSchema = new mongoose_1.Schema({
    cameraInstallationId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Camera' }, profileName: { type: String, required: true, trim: true }, version: { type: Number, required: true, default: 1 }, method: { type: String, enum: Object.values(CalibrationMethod), required: true }, status: { type: String, enum: Object.values(CalibrationStatus), default: CalibrationStatus.DRAFT }, intrinsicParameters: { type: IntrinsicParametersSchema, required: true }, extrinsicParameters: { type: ExtrinsicParametersSchema, required: true }, referencePoints: { type: [ReferencePointSchema], required: true }, homographyMatrix: { type: HomographyMatrixSchema, required: true }, metrics: { type: CalibrationMetricsSchema, required: true }, validationResults: { passed: { type: Boolean }, details: { type: mongoose_1.Schema.Types.Mixed }, validatedAt: { type: Date }, validatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' } }, aiMetadata: { modelVersion: { type: String }, trainingDataHash: { type: String }, featureExtractionConfig: { type: mongoose_1.Schema.Types.Mixed }, inferenceThreshold: { type: Number, min: 0, max: 1 } }, notes: { type: String }, createdBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' }, activatedAt: { type: Date }, activatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, archivedAt: { type: Date }, archivedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, collection: 'calibration_profiles' });
CalibrationProfileSchema.index({ cameraInstallationId: 1, status: 1 });
CalibrationProfileSchema.index({ cameraInstallationId: 1, version: -1 });
CalibrationProfileSchema.index({ status: 1, createdAt: -1 });
CalibrationProfileSchema.pre('save', function (next) {
    if (this.isNew && this.version === 1) {
        const existing = this.constructor.findOne({ cameraInstallationId: this.cameraInstallationId }).sort({ version: -1 });
        if (existing)
            this.version = existing.version + 1;
    }
    next();
});
exports.CalibrationProfile = mongoose_1.models.CalibrationProfile || (0, mongoose_1.model)('CalibrationProfile', CalibrationProfileSchema);
//# sourceMappingURL=calibration.schema.js.map