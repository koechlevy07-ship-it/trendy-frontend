"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const camera_schema_1 = require("../schemas/camera.schema");
class CameraRepository extends base_repository_1.MongoRepository {
    constructor(model) { super(model); }
    async findByCameraId(cameraId) { return this.model.findOne({ cameraId: cameraId.toUpperCase() }).exec(); }
    async findByCourt(courtId, pagination) { const query = this.model.find({ courtId: new mongoose_1.Types.ObjectId(courtId) }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findActiveByCourt(courtId) { return this.model.find({ courtId: new mongoose_1.Types.ObjectId(courtId), status: { $in: [camera_schema_1.CameraStatus.ACTIVE, camera_schema_1.CameraStatus.CONNECTED, camera_schema_1.CameraStatus.CALIBRATED] } }).sort({ createdAt: -1 }).exec(); }
    async findBySerialNumber(serialNumber) { return this.model.findOne({ serialNumber }).exec(); }
    async findByStatus(status, pagination) { const query = this.model.find({ status }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findByMountType(mountType, pagination) { const query = this.model.find({ mountType }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findByManufacturer(manufacturer, pagination) { const query = this.model.find({ manufacturer }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findByCalibrationProfile(calibrationProfileId) { return this.model.find({ calibrationProfileId: new mongoose_1.Types.ObjectId(calibrationProfileId) }).exec(); }
    async findUncalibrated() { return this.model.find({ calibrationProfileId: { $exists: false }, status: { $in: [camera_schema_1.CameraStatus.REGISTERED, camera_schema_1.CameraStatus.CONNECTED, camera_schema_1.CameraStatus.ACTIVE] } }).sort({ createdAt: -1 }).exec(); }
    async findWithErrors() { return this.model.find({ status: camera_schema_1.CameraStatus.ERROR }).sort({ updatedAt: -1 }).exec(); }
    async findNeedingMaintenance() { return this.model.find({ status: camera_schema_1.CameraStatus.MAINTENANCE }).sort({ updatedAt: -1 }).exec(); }
    async updateHeartbeat(id) { return this.model.findByIdAndUpdate(id, { lastHeartbeat: new Date(), status: camera_schema_1.CameraStatus.CONNECTED }, { new: true }).exec(); }
    async updateStatus(id, status, errorMessage) { const update = { status }; if (errorMessage)
        update.errorMessage = errorMessage; if (status === camera_schema_1.CameraStatus.ACTIVE)
        update.activatedAt = new Date(); if (status === camera_schema_1.CameraStatus.DECOMMISSIONED)
        update.decommissionedAt = new Date(); return this.model.findByIdAndUpdate(id, update, { new: true }).exec(); }
    async assignCalibrationProfile(id, calibrationProfileId) { return this.model.findByIdAndUpdate(id, { calibrationProfileId, status: camera_schema_1.CameraStatus.CALIBRATED, calibratedAt: new Date() }, { new: true }).exec(); }
    async assignCoverageZone(id, coverageZoneId) { return this.model.findByIdAndUpdate(id, { $addToSet: { assignedCoverageZones: coverageZoneId } }, { new: true }).exec(); }
    async removeCoverageZone(id, coverageZoneId) { return this.model.findByIdAndUpdate(id, { $pull: { assignedCoverageZones: coverageZoneId } }, { new: true }).exec(); }
    async updatePosition(id, position) { return this.model.findByIdAndUpdate(id, { position, status: camera_schema_1.CameraStatus.CALIBRATING }, { new: true }).exec(); }
    async updateStreamConfig(id, streamConfig) { return this.model.findByIdAndUpdate(id, { streamConfig }, { new: true }).exec(); }
    async updateHealthMetrics(id, metrics) { return this.model.findByIdAndUpdate(id, { $set: { healthMetrics: metrics } }, { new: true }).exec(); }
    async recordError(id, error) { return this.model.findByIdAndUpdate(id, { $inc: { 'healthMetrics.errorCount': 1 }, errorMessage: error, status: camera_schema_1.CameraStatus.ERROR }, { new: true }).exec(); }
    async getCameraStats(courtId) { const [total, active, calibrating, calibrated, error, maintenance, byMountType] = await Promise.all([this.model.countDocuments({ courtId: new mongoose_1.Types.ObjectId(courtId) }), this.model.countDocuments({ courtId: new mongoose_1.Types.ObjectId(courtId), status: { $in: [camera_schema_1.CameraStatus.ACTIVE, camera_schema_1.CameraStatus.CONNECTED] } }), this.model.countDocuments({ courtId: new mongoose_1.Types.ObjectId(courtId), status: camera_schema_1.CameraStatus.CALIBRATING }), this.model.countDocuments({ courtId: new mongoose_1.Types.ObjectId(courtId), status: camera_schema_1.CameraStatus.CALIBRATED }), this.model.countDocuments({ courtId: new mongoose_1.Types.ObjectId(courtId), status: camera_schema_1.CameraStatus.ERROR }), this.model.countDocuments({ courtId: new mongoose_1.Types.ObjectId(courtId), status: camera_schema_1.CameraStatus.MAINTENANCE }), this.model.aggregate([{ $match: { courtId: new mongoose_1.Types.ObjectId(courtId) } }, { $group: { _id: '$mountType', count: { $sum: 1 } } }]),]); return { total, active, calibrating, calibrated, error, maintenance, byMountType: byMountType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}) }; }
}
exports.CameraRepository = CameraRepository;
//# sourceMappingURL=camera.repository.js.map