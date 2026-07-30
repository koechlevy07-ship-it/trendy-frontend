"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const facility_schema_1 = require("../schemas/facility.schema");
class FacilityRepository extends base_repository_1.MongoRepository {
    constructor(model) { super(model); }
    async findByFacilityCode(venueId, facilityCode) { return this.model.findOne({ venueId: new mongoose_1.Types.ObjectId(venueId), facilityCode: facilityCode.toUpperCase() }).exec(); }
    async findByVenue(venueId, pagination) { const query = this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId) }).sort({ facilityType: 1, name: 1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findByType(facilityType, pagination) { const query = this.model.find({ facilityType }).sort({ venueId: 1, name: 1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findByStatus(status, pagination) { const query = this.model.find({ status }).sort({ venueId: 1, facilityType: 1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findByCourt(courtId) { return this.model.find({ 'location.nearestCourt': new mongoose_1.Types.ObjectId(courtId) }).exec(); }
    async findAvailable(venueId, startTime, endTime) { return this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId), status: facility_schema_1.FacilityStatus.AVAILABLE, 'accessControl.accessHours': { $elemMatch: { start: { $lte: startTime.toTimeString().slice(0, 5) }, end: { $gte: endTime.toTimeString().slice(0, 5) } } } }).exec(); }
    async findByFloor(venueId, floor) { return this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId), 'location.floor': floor }).sort({ name: 1 }).exec(); }
    async findWheelchairAccessible(venueId) { return this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId), 'features.isWheelchairAccessible': true }).exec(); }
    async findWithEquipment(venueId) { return this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId), assignedEquipment: { $ne: [] } }).populate('assignedEquipment').exec(); }
    async updateStatus(id, status) { return this.model.findByIdAndUpdate(id, { status }, { new: true }).exec(); }
    async assignEquipment(id, equipmentId) { return this.model.findByIdAndUpdate(id, { $addToSet: { assignedEquipment: equipmentId } }, { new: true }).exec(); }
    async removeEquipment(id, equipmentId) { return this.model.findByIdAndUpdate(id, { $pull: { assignedEquipment: equipmentId } }, { new: true }).exec(); }
    async updateUtilization(id, hoursUsed) { return this.model.findByIdAndUpdate(id, { $inc: { 'utilizationMetrics.totalBookings': 1, 'utilizationMetrics.totalHoursUsed': hoursUsed }, $set: { 'utilizationMetrics.lastUpdated': new Date() } }, { new: true }).exec(); }
    async updateMaintenanceSchedule(id, lastMaintenance, nextMaintenance) { return this.model.findByIdAndUpdate(id, { 'maintenanceSchedule.lastMaintenance': lastMaintenance, 'maintenanceSchedule.nextMaintenance': nextMaintenance }, { new: true }).exec(); }
    async updateCleaningSchedule(id, lastCleaning, nextCleaning) { return this.model.findByIdAndUpdate(id, { 'cleaningSchedule.lastCleaning': lastCleaning, 'cleaningSchedule.nextCleaning': nextCleaning }, { new: true }).exec(); }
    async getFacilityStats(venueId) { const [total, byType, byStatus, available, underMaintenance, capacity] = await Promise.all([this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId) }), this.model.aggregate([{ $match: { venueId: new mongoose_1.Types.ObjectId(venueId) } }, { $group: { _id: '$facilityType', count: { $sum: 1 } } }]), this.model.aggregate([{ $match: { venueId: new mongoose_1.Types.ObjectId(venueId) } }, { $group: { _id: '$status', count: { $sum: 1 } } }]), this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId), status: facility_schema_1.FacilityStatus.AVAILABLE }), this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId), status: facility_schema_1.FacilityStatus.MAINTENANCE }), this.model.aggregate([{ $match: { venueId: new mongoose_1.Types.ObjectId(venueId) } }, { $group: { _id: null, seated: { $sum: '$capacity.seated' }, standing: { $sum: '$capacity.standing' }, maxOccupancy: { $sum: '$capacity.maxOccupancy' } } }]),]); return { total, byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), available, underMaintenance, totalCapacity: capacity[0] || { seated: 0, standing: 0, maxOccupancy: 0 } }; }
}
exports.FacilityRepository = FacilityRepository;
//# sourceMappingURL=facility.repository.js.map