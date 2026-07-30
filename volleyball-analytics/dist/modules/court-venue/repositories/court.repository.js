"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourtRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const court_schema_1 = require("../schemas/court.schema");
class CourtRepository extends base_repository_1.MongoRepository {
    constructor(model) { super(model); }
    async findByCourtCode(venueId, courtCode) { return this.model.findOne({ venueId: new mongoose_1.Types.ObjectId(venueId), courtCode: courtCode.toUpperCase() }).exec(); }
    async findByVenue(venueId, pagination) { const query = this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId) }).sort({ courtCode: 1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findActiveByVenue(venueId) { return this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId), status: court_schema_1.CourtStatus.ACTIVE, maintenanceStatus: { $ne: court_schema_1.MaintenanceStatus.IN_PROGRESS } }).sort({ courtCode: 1 }).exec(); }
    async findByType(courtType, pagination) { const query = this.model.find({ courtType }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findBySurfaceType(surfaceType, pagination) { const query = this.model.find({ surfaceType }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findByStatus(status, pagination) { const query = this.model.find({ status }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findByCameraProfile(cameraProfileId) { return this.model.find({ cameraProfileId: new mongoose_1.Types.ObjectId(cameraProfileId) }).exec(); }
    async findByCalibrationProfile(calibrationProfileId) { return this.model.find({ calibrationProfileId: new mongoose_1.Types.ObjectId(calibrationProfileId) }).exec(); }
    async findAvailableCourts(venueId, startDate, endDate) { return this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId), status: court_schema_1.CourtStatus.ACTIVE, maintenanceStatus: court_schema_1.MaintenanceStatus.NONE, 'availability.isBookable': true, 'availability.blockoutDates': { $not: { $elemMatch: { $gte: startDate, $lte: endDate } } } }).sort({ courtCode: 1 }).exec(); }
    async findUnderMaintenance() { return this.model.find({ $or: [{ status: court_schema_1.CourtStatus.MAINTENANCE }, { maintenanceStatus: { $in: [court_schema_1.MaintenanceStatus.SCHEDULED, court_schema_1.MaintenanceStatus.IN_PROGRESS] } }] }).sort({ maintenanceScheduledAt: 1 }).exec(); }
    async findOverdueMaintenance() { const now = new Date(); return this.model.find({ maintenanceStatus: { $in: [court_schema_1.MaintenanceStatus.SCHEDULED, court_schema_1.MaintenanceStatus.IN_PROGRESS] }, maintenanceScheduledAt: { $lt: now } }).sort({ maintenanceScheduledAt: 1 }).exec(); }
    async activateCourt(id, activatedBy) { return this.model.findByIdAndUpdate(id, { status: court_schema_1.CourtStatus.ACTIVE, activatedAt: new Date(), activatedBy }, { new: true, runValidators: true }).exec(); }
    async setMaintenanceMode(id, status, scheduledAt, reason) { const update = { maintenanceStatus: status }; if (status === court_schema_1.MaintenanceStatus.SCHEDULED) {
        update.status = court_schema_1.CourtStatus.MAINTENANCE;
        update.maintenanceScheduledAt = scheduledAt;
    }
    else if (status === court_schema_1.MaintenanceStatus.IN_PROGRESS) {
        update.status = court_schema_1.CourtStatus.MAINTENANCE;
    }
    else if (status === court_schema_1.MaintenanceStatus.COMPLETED) {
        update.maintenanceCompletedAt = new Date();
        if (reason)
            update.metadata = { maintenanceReason: reason };
    }
    else if (status === court_schema_1.MaintenanceStatus.NONE) {
        update.maintenanceCompletedAt = new Date();
    } return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec(); }
    async archiveCourt(id, archivedBy) { return this.model.findByIdAndUpdate(id, { status: court_schema_1.CourtStatus.ARCHIVED, archivedAt: new Date(), archivedBy }, { new: true, runValidators: true }).exec(); }
    async restoreCourt(id) { return this.model.findByIdAndUpdate(id, { status: court_schema_1.CourtStatus.DRAFT, archivedAt: null, archivedBy: null }, { new: true, runValidators: true }).exec(); }
    async assignCamera(id, cameraId) { return this.model.findByIdAndUpdate(id, { $addToSet: { assignedCameraIds: cameraId } }, { new: true, runValidators: true }).exec(); }
    async unassignCamera(id, cameraId) { return this.model.findByIdAndUpdate(id, { $pull: { assignedCameraIds: cameraId } }, { new: true, runValidators: true }).exec(); }
    async setCameraProfile(id, cameraProfileId) { return this.model.findByIdAndUpdate(id, { cameraProfileId }, { new: true, runValidators: true }).exec(); }
    async setCalibrationProfile(id, calibrationProfileId) { return this.model.findByIdAndUpdate(id, { calibrationProfileId }, { new: true, runValidators: true }).exec(); }
    async updateAIConfiguration(id, config) { return this.model.findByIdAndUpdate(id, { $set: { 'aiConfiguration': { ...config } } }, { new: true, runValidators: true }).exec(); }
    async addBlockoutDate(id, date) { return this.model.findByIdAndUpdate(id, { $addToSet: { 'availability.blockoutDates': date } }, { new: true, runValidators: true }).exec(); }
    async removeBlockoutDate(id, date) { return this.model.findByIdAndUpdate(id, { $pull: { 'availability.blockoutDates': date } }, { new: true, runValidators: true }).exec(); }
    async getCourtStats(venueId) { const [total, active, maintenance, suspended, archived, byType, bySurface] = await Promise.all([this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId) }), this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId), status: court_schema_1.CourtStatus.ACTIVE }), this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId), $or: [{ status: court_schema_1.CourtStatus.MAINTENANCE }, { maintenanceStatus: { $in: [court_schema_1.MaintenanceStatus.SCHEDULED, court_schema_1.MaintenanceStatus.IN_PROGRESS] } }] }), this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId), status: court_schema_1.CourtStatus.SUSPENDED }), this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId), status: court_schema_1.CourtStatus.ARCHIVED }), this.model.aggregate([{ $match: { venueId: new mongoose_1.Types.ObjectId(venueId) } }, { $group: { _id: '$courtType', count: { $sum: 1 } } }]), this.model.aggregate([{ $match: { venueId: new mongoose_1.Types.ObjectId(venueId) } }, { $group: { _id: '$surfaceType', count: { $sum: 1 } } }]),]); return { total, active, maintenance, suspended, archived, byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), bySurface: bySurface.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}) }; }
}
exports.CourtRepository = CourtRepository;
//# sourceMappingURL=court.repository.js.map