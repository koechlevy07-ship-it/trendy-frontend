"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const maintenance_schema_1 = require("../schemas/maintenance.schema");
class MaintenanceRepository extends base_repository_1.MongoRepository {
    constructor(model) {
        super(model);
    }
    async findByMaintenanceCode(maintenanceCode) {
        return this.model.findOne({ maintenanceCode: maintenanceCode.toUpperCase() }).exec();
    }
    async findByVenue(venueId, pagination) {
        const query = this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId) }).sort({ scheduledDate: -1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findByCourt(courtId) {
        return this.model.find({ courtId: new mongoose_1.Types.ObjectId(courtId) }).sort({ scheduledDate: -1 }).exec();
    }
    async findByFacility(facilityId) {
        return this.model.find({ facilityId: new mongoose_1.Types.ObjectId(facilityId) }).sort({ scheduledDate: -1 }).exec();
    }
    async findByEquipment(equipmentId) {
        return this.model.find({ equipmentId: new mongoose_1.Types.ObjectId(equipmentId) }).sort({ scheduledDate: -1 }).exec();
    }
    async findBySensor(sensorId) {
        return this.model.find({ sensorId: new mongoose_1.Types.ObjectId(sensorId) }).sort({ scheduledDate: -1 }).exec();
    }
    async findByCamera(cameraId) {
        return this.model.find({ cameraId: new mongoose_1.Types.ObjectId(cameraId) }).sort({ scheduledDate: -1 }).exec();
    }
    async findByCalibrationProfile(calibrationProfileId) {
        return this.model.find({ calibrationProfileId: new mongoose_1.Types.ObjectId(calibrationProfileId) }).sort({ scheduledDate: -1 }).exec();
    }
    async findByType(maintenanceType, pagination) {
        const query = this.model.find({ maintenanceType }).sort({ scheduledDate: -1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findByStatus(status, pagination) {
        const query = this.model.find({ status }).sort({ scheduledDate: -1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findByPriority(priority, pagination) {
        const query = this.model.find({ priority }).sort({ scheduledDate: -1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findScheduledForDate(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.model
            .find({
            scheduledDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: [maintenance_schema_1.MaintenanceStatus.SCHEDULED, maintenance_schema_1.MaintenanceStatus.ASSIGNED] },
        })
            .sort({ scheduledDate: 1 })
            .exec();
    }
    async findOverdue() {
        return this.model
            .find({
            status: { $in: [maintenance_schema_1.MaintenanceStatus.SCHEDULED, maintenance_schema_1.MaintenanceStatus.ASSIGNED] },
            scheduledDate: { $lt: new Date() },
        })
            .sort({ scheduledDate: 1 })
            .exec();
    }
    async findByTechnician(technicianId, pagination) {
        const query = this.model.find({ assignedTechnicianId: new mongoose_1.Types.ObjectId(technicianId) }).sort({ scheduledDate: -1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findRequiringFollowUp() {
        return this.model
            .find({
            followUpRequired: true,
            followUpDate: { $lte: new Date() },
        })
            .sort({ followUpDate: 1 })
            .exec();
    }
    async findByDateRange(startDate, endDate) {
        return this.model
            .find({
            scheduledDate: { $gte: startDate, $lte: endDate },
        })
            .sort({ scheduledDate: -1 })
            .exec();
    }
    async startMaintenance(id, technicianId, technicianName) {
        return this.model
            .findByIdAndUpdate(id, {
            status: maintenance_schema_1.MaintenanceStatus.IN_PROGRESS,
            actualStartDate: new Date(),
            assignedTechnicianId: technicianId,
            assignedTechnicianName: technicianName,
        }, { new: true })
            .exec();
    }
    async completeMaintenance(id, findings, recommendations, followUpRequired, followUpDate, followUpDescription) {
        return this.model
            .findByIdAndUpdate(id, {
            status: maintenance_schema_1.MaintenanceStatus.COMPLETED,
            actualEndDate: new Date(),
            findings,
            recommendations,
            followUpRequired,
            followUpDate,
            followUpDescription,
        }, { new: true })
            .exec();
    }
    async cancelMaintenance(id, reason) {
        return this.model
            .findByIdAndUpdate(id, {
            status: maintenance_schema_1.MaintenanceStatus.CANCELLED,
            findings: reason,
        }, { new: true })
            .exec();
    }
    async addChecklistItem(id, item) {
        return this.model
            .findByIdAndUpdate(id, { $push: { checklist: { ...item, totalCost: item.quantity * item.unitCost } } }, { new: true })
            .exec();
    }
    async updateChecklistItem(id, itemId, updates) {
        return this.model
            .findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(id), 'checklist.itemId': itemId }, { $set: { 'checklist.$': { ...updates, totalCost: updates.quantity ? updates.quantity * updates.unitCost : undefined } } }, { new: true })
            .exec();
    }
    async completeChecklistItem(id, itemId, completedBy, status, notes, evidence) {
        return this.model
            .findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(id), 'checklist.itemId': itemId }, {
            $set: {
                'checklist.$.status': status,
                'checklist.$.completedAt': new Date(),
                'checklist.$.completedBy': completedBy,
                'checklist.$.notes': notes,
                'checklist.$.evidence': evidence,
            },
        }, { new: true })
            .exec();
    }
    async addPart(id, part) {
        return this.model
            .findByIdAndUpdate(id, { $push: { partsUsed: { ...part, totalCost: part.quantity * part.unitCost } } }, { new: true })
            .exec();
    }
    async addLabor(id, labor) {
        return this.model
            .findByIdAndUpdate(id, { $push: { labor: { ...labor, totalCost: labor.hoursWorked * labor.hourlyRate } } }, { new: true })
            .exec();
    }
    async addDocument(id, documentId) {
        return this.model.findByIdAndUpdate(id, { $addToSet: { documents: documentId } }, { new: true }).exec();
    }
    async addPhoto(id, photoUrl) {
        return this.model.findByIdAndUpdate(id, { $push: { photos: photoUrl } }, { new: true }).exec();
    }
    async signOff(id, technicianId, technicianName, signatureData) {
        return this.model
            .findByIdAndUpdate(id, { $push: { signatures: { technicianId, technicianName, signedAt: new Date(), signatureData } } }, { new: true })
            .exec();
    }
    async requestApproval(id, approvedBy, comments) {
        return this.model
            .findByIdAndUpdate(id, { $push: { approvals: { approvedBy, approvedAt: new Date(), version: 1, comments } } }, { new: true })
            .exec();
    }
    async getMaintenanceStats(venueId) {
        const match = venueId ? { venueId: new mongoose_1.Types.ObjectId(venueId) } : {};
        const [total, byType, byStatus, byPriority, scheduled, inProgress, completed, overdue, costs, durations,] = await Promise.all([
            this.model.countDocuments(match),
            this.model.aggregate([{ $match: match }, { $group: { _id: '$maintenanceType', count: { $sum: 1 } } }]),
            this.model.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
            this.model.aggregate([{ $match: match }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
            this.model.countDocuments({ ...match, status: maintenance_schema_1.MaintenanceStatus.SCHEDULED }),
            this.model.countDocuments({ ...match, status: maintenance_schema_1.MaintenanceStatus.IN_PROGRESS }),
            this.model.countDocuments({ ...match, status: maintenance_schema_1.MaintenanceStatus.COMPLETED }),
            this.model.countDocuments({
                ...match,
                status: { $in: [maintenance_schema_1.MaintenanceStatus.SCHEDULED, maintenance_schema_1.MaintenanceStatus.ASSIGNED] },
                scheduledDate: { $lt: new Date() },
            }),
            this.model.aggregate([
                { $match: { ...match, status: maintenance_schema_1.MaintenanceStatus.COMPLETED } },
                { $group: { _id: null, total: { $sum: '$totalCost' }, avg: { $avg: '$totalCost' } } },
            ]),
            this.model.aggregate([
                { $match: { ...match, status: maintenance_schema_1.MaintenanceStatus.COMPLETED, actualDurationMinutes: { $exists: true } } },
                { $group: { _id: null, avg: { $avg: '$actualDurationMinutes' } } },
            ]),
        ]);
        return {
            total,
            byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            scheduled,
            inProgress,
            completed,
            overdue,
            totalCost: costs[0]?.total || 0,
            avgCost: costs[0]?.avg || 0,
            avgDuration: durations[0]?.avg || 0,
        };
    }
}
exports.MaintenanceRepository = MaintenanceRepository;
//# sourceMappingURL=maintenance.repository.js.map