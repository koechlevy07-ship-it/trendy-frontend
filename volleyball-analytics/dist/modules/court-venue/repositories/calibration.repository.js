"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalibrationRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const calibration_schema_1 = require("../schemas/calibration.schema");
class CalibrationRepository extends base_repository_1.MongoRepository {
    constructor(model) { super(model); }
    async findByCameraInstallation(cameraInstallationId, pagination) { const query = this.model.find({ cameraInstallationId: new mongoose_1.Types.ObjectId(cameraInstallationId) }).sort({ version: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findActiveByCamera(cameraInstallationId) { return this.model.findOne({ cameraInstallationId: new mongoose_1.Types.ObjectId(cameraInstallationId), status: calibration_schema_1.CalibrationStatus.ACTIVE }).sort({ version: -1 }).exec(); }
    async findLatestByCamera(cameraInstallationId) { return this.model.findOne({ cameraInstallationId: new mongoose_1.Types.ObjectId(cameraInstallationId) }).sort({ version: -1 }).exec(); }
    async findByStatus(status, pagination) { const query = this.model.find({ status }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findByMethod(method, pagination) { const query = this.model.find({ method }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findValidated() { return this.model.find({ status: calibration_schema_1.CalibrationStatus.ACTIVE, 'validationResults.passed': true }).sort({ 'validationResults.validatedAt': -1 }).exec(); }
    async findPendingValidation() { return this.model.find({ status: calibration_schema_1.CalibrationStatus.PENDING_VALIDATION }).sort({ createdAt: 1 }).exec(); }
    async findNeedingRecalibration(maxError = 1.0) { return this.model.find({ status: calibration_schema_1.CalibrationStatus.ACTIVE, 'metrics.reprojectionError': { $gt: maxError } }).sort({ 'metrics.reprojectionError': -1 }).exec(); }
    async activateProfile(id, activatedBy) { await this.model.updateMany({ cameraInstallationId: (await this.model.findById(id))?.cameraInstallationId, status: calibration_schema_1.CalibrationStatus.ACTIVE }, { status: calibration_schema_1.CalibrationStatus.ARCHIVED }); return this.model.findByIdAndUpdate(id, { status: calibration_schema_1.CalibrationStatus.ACTIVE, activatedAt: new Date(), activatedBy }, { new: true }).exec(); }
    async archiveProfile(id, archivedBy) { return this.model.findByIdAndUpdate(id, { status: calibration_schema_1.CalibrationStatus.ARCHIVED, archivedAt: new Date(), archivedBy }, { new: true }).exec(); }
    async setValidationResult(id, passed, details, validatedBy) { return this.model.findByIdAndUpdate(id, { 'validationResults.passed': passed, 'validationResults.details': details, 'validationResults.validatedAt': new Date(), 'validationResults.validatedBy': validatedBy }, { new: true }).exec(); }
    async updateMetrics(id, metrics) { return this.model.findByIdAndUpdate(id, { $set: { metrics } }, { new: true }).exec(); }
    async updateAIProfile(id, aiMetadata) { return this.model.findByIdAndUpdate(id, { $set: { aiMetadata } }, { new: true }).exec(); }
    async getCalibrationStats() { const [total, draft, pending, active, archived, failed, byMethod, metrics] = await Promise.all([this.model.countDocuments(), this.model.countDocuments({ status: calibration_schema_1.CalibrationStatus.DRAFT }), this.model.countDocuments({ status: calibration_schema_1.CalibrationStatus.PENDING_VALIDATION }), this.model.countDocuments({ status: calibration_schema_1.CalibrationStatus.ACTIVE }), this.model.countDocuments({ status: calibration_schema_1.CalibrationStatus.ARCHIVED }), this.model.countDocuments({ status: calibration_schema_1.CalibrationStatus.FAILED }), this.model.aggregate([{ $group: { _id: '$method', count: { $sum: 1 } } }]), this.model.aggregate([{ $match: { status: calibration_schema_1.CalibrationStatus.ACTIVE } }, { $group: { _id: null, avgError: { $avg: '$metrics.reprojectionError' } } }]),]); return { total, draft, pending, active, archived, failed, byMethod: byMethod.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), avgReprojectionError: metrics[0]?.avgError || 0 }; }
}
exports.CalibrationRepository = CalibrationRepository;
//# sourceMappingURL=calibration.repository.js.map