"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const equipment_schema_1 = require("../schemas/equipment.schema");
class EquipmentRepository extends base_repository_1.MongoRepository {
    constructor(model) {
        super(model);
    }
    async findByEquipmentCode(venueId, equipmentCode) {
        return this.model.findOne({
            venueId: new mongoose_1.Types.ObjectId(venueId),
            equipmentCode: equipmentCode.toUpperCase(),
        }).exec();
    }
    async findBySerialNumber(serialNumber) {
        return this.model.findOne({ serialNumber }).exec();
    }
    async findByAssetTag(assetTag) {
        return this.model.findOne({ assetTag }).exec();
    }
    async findByVenue(venueId, pagination) {
        const query = this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId) }).sort({ createdAt: -1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findByCourt(courtId) {
        return this.model.find({ courtId: new mongoose_1.Types.ObjectId(courtId) }).exec();
    }
    async findByFacility(facilityId) {
        return this.model.find({ facilityId: new mongoose_1.Types.ObjectId(facilityId) }).exec();
    }
    async findByCategory(category, pagination) {
        const query = this.model.find({ category }).sort({ createdAt: -1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findByStatus(status, pagination) {
        const query = this.model.find({ status }).sort({ createdAt: -1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findAvailable(venueId) {
        return this.model
            .find({
            venueId: new mongoose_1.Types.ObjectId(venueId),
            status: equipment_schema_1.EquipmentStatus.AVAILABLE,
        })
            .sort({ name: 1 })
            .exec();
    }
    async findByCondition(condition) {
        return this.model.find({ condition }).exec();
    }
    async findByAssignedTo(userId) {
        return this.model.find({ assignedTo: new mongoose_1.Types.ObjectId(userId) }).exec();
    }
    async findExpiringWarranty(days = 30) {
        const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        return this.model.find({ warrantyExpiry: { $lte: threshold, $gte: new Date() } }).exec();
    }
    async findExpiringCertifications(days = 30) {
        const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        return this.model.find({
            'certifications.expiryDate': { $lte: threshold, $gte: new Date() },
            'certifications.status': 'valid',
        }).exec();
    }
    async findDueCalibration() {
        const now = new Date();
        return this.model.find({
            'calibrationRecords.nextCalibrationDue': { $lte: now },
        }).exec();
    }
    async findUnderMaintenance() {
        return this.model.find({
            status: { $in: [equipment_schema_1.EquipmentStatus.MAINTENANCE, equipment_schema_1.EquipmentStatus.REPAIR] },
        }).exec();
    }
    async assignEquipment(id, userId, location) {
        return this.model
            .findByIdAndUpdate(id, {
            status: equipment_schema_1.EquipmentStatus.IN_USE,
            assignedTo: userId,
            location: location || 'assigned',
        }, { new: true, runValidators: true })
            .exec();
    }
    async unassignEquipment(id) {
        return this.model
            .findByIdAndUpdate(id, {
            status: equipment_schema_1.EquipmentStatus.AVAILABLE,
            assignedTo: null,
        }, { new: true, runValidators: true })
            .exec();
    }
    async setMaintenanceStatus(id, status) {
        return this.model
            .findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
            .exec();
    }
    async addMaintenanceRecord(id, record) {
        return this.model
            .findByIdAndUpdate(id, { $push: { maintenanceHistory: { ...record, totalCost: record.quantity * record.unitCost } } }, { new: true, runValidators: true })
            .exec();
    }
    async addCertification(id, certification) {
        return this.model
            .findByIdAndUpdate(id, { $push: { certifications: certification } }, { new: true, runValidators: true })
            .exec();
    }
    async updateCertificationStatus(id, certificationIndex, status) {
        const equipment = await this.model.findById(id);
        if (!equipment)
            return null;
        if (equipment.certifications[certificationIndex]) {
            equipment.certifications[certificationIndex].status = status;
        }
        return equipment.save();
    }
    async addCalibrationRecord(id, record) {
        return this.model
            .findByIdAndUpdate(id, { $push: { calibrationRecords: record } }, { new: true, runValidators: true })
            .exec();
    }
    async retireEquipment(id, reason) {
        return this.model
            .findByIdAndUpdate(id, {
            status: equipment_schema_1.EquipmentStatus.RETIRED,
            retiredAt: new Date(),
            retiredReason: reason,
        }, { new: true, runValidators: true })
            .exec();
    }
    async getEquipmentStats(venueId) {
        const [total, byCategory, byStatus, byCondition, available, inUse, underMaintenance, retired, expiringWarranty, expiringCertifications, dueCalibration,] = await Promise.all([
            this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId) }),
            this.model.aggregate([
                { $match: { venueId: new mongoose_1.Types.ObjectId(venueId) } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
            ]),
            this.model.aggregate([
                { $match: { venueId: new mongoose_1.Types.ObjectId(venueId) } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            this.model.aggregate([
                { $match: { venueId: new mongoose_1.Types.ObjectId(venueId) } },
                { $group: { _id: '$condition', count: { $sum: 1 } } },
            ]),
            this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId), status: equipment_schema_1.EquipmentStatus.AVAILABLE }),
            this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId), status: equipment_schema_1.EquipmentStatus.IN_USE }),
            this.model.countDocuments({
                venueId: new mongoose_1.Types.ObjectId(venueId),
                status: { $in: [equipment_schema_1.EquipmentStatus.MAINTENANCE, equipment_schema_1.EquipmentStatus.REPAIR] },
            }),
            this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId), status: equipment_schema_1.EquipmentStatus.RETIRED }),
            this.model.countDocuments({
                venueId: new mongoose_1.Types.ObjectId(venueId),
                warrantyExpiry: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gte: new Date() },
            }),
            this.model.countDocuments({
                venueId: new mongoose_1.Types.ObjectId(venueId),
                'certifications.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gte: new Date() },
                'certifications.status': 'valid',
            }),
            this.model.countDocuments({
                venueId: new mongoose_1.Types.ObjectId(venueId),
                'calibrationRecords.nextCalibrationDue': { $lte: new Date() },
            }),
        ]);
        return {
            total,
            byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            byCondition: byCondition.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            available,
            inUse,
            underMaintenance,
            retired,
            expiringWarranty,
            expiringCertifications,
            dueCalibration,
        };
    }
}
exports.EquipmentRepository = EquipmentRepository;
//# sourceMappingURL=equipment.repository.js.map