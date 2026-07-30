"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverageZoneRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const coverage_zone_schema_1 = require("../schemas/coverage-zone.schema");
class CoverageZoneRepository extends base_repository_1.MongoRepository {
    constructor(model) {
        super(model);
    }
    async findByZoneCode(courtId, zoneCode) {
        return this.model.findOne({
            courtId: new mongoose_1.Types.ObjectId(courtId),
            zoneCode: zoneCode.toUpperCase(),
        }).exec();
    }
    async findByCourt(courtId, pagination) {
        const query = this.model.find({ courtId: new mongoose_1.Types.ObjectId(courtId) }).sort({ priority: -1, createdAt: -1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findByType(zoneType, pagination) {
        const query = this.model.find({ zoneType }).sort({ createdAt: -1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findByPriority(priority, pagination) {
        const query = this.model.find({ priority }).sort({ createdAt: -1 });
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
    async findByCamera(cameraId) {
        return this.model.find({ assignedCameras: new mongoose_1.Types.ObjectId(cameraId) }).exec();
    }
    async findCriticalZones(courtId) {
        return this.model
            .find({
            courtId: new mongoose_1.Types.ObjectId(courtId),
            priority: coverage_zone_schema_1.CoveragePriority.CRITICAL,
        })
            .sort({ name: 1 })
            .exec();
    }
    async findActiveZones(courtId) {
        return this.model
            .find({
            courtId: new mongoose_1.Types.ObjectId(courtId),
            status: 'active',
        })
            .sort({ name: 1 })
            .exec();
    }
    async findZonesNeedingCalibration() {
        return this.model
            .find({
            status: { $in: ['configured', 'calibrated'] },
            'validationResults': { $exists: false },
        })
            .exec();
    }
    async findDegradedZones() {
        return this.model.find({ status: 'degraded' }).exec();
    }
    async assignCamera(id, cameraId) {
        return this.model
            .findByIdAndUpdate(id, { $addToSet: { assignedCameras: cameraId } }, { new: true })
            .exec();
    }
    async unassignCamera(id, cameraId) {
        return this.model
            .findByIdAndUpdate(id, { $pull: { assignedCameras: cameraId } }, { new: true })
            .exec();
    }
    async updateStatus(id, status) {
        return this.model.findByIdAndUpdate(id, { status }, { new: true }).exec();
    }
    async updateMetrics(id, metrics) {
        return this.model
            .findByIdAndUpdate(id, { $set: { coverageMetrics: metrics } }, { new: true })
            .exec();
    }
    async setValidationResults(id, results) {
        return this.model
            .findByIdAndUpdate(id, { $set: { validationResults: results } }, { new: true })
            .exec();
    }
    async recalculateMetrics(id) {
        return this.model.findByIdAndUpdate(id, { $set: { 'coverageMetrics.lastCalculated': new Date() } }, { new: true }).exec();
    }
    async getZoneStats(courtId) {
        const [total, byType, byPriority, byStatus, zones,] = await Promise.all([
            this.model.countDocuments({ courtId: new mongoose_1.Types.ObjectId(courtId) }),
            this.model.aggregate([
                { $match: { courtId: new mongoose_1.Types.ObjectId(courtId) } },
                { $group: { _id: '$zoneType', count: { $sum: 1 } } },
            ]),
            this.model.aggregate([
                { $match: { courtId: new mongoose_1.Types.ObjectId(courtId) } },
                { $group: { _id: '$priority', count: { $sum: 1 } } },
            ]),
            this.model.aggregate([
                { $match: { courtId: new mongoose_1.Types.ObjectId(courtId) } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            this.model.find({ courtId: new mongoose_1.Types.ObjectId(courtId) }).exec(),
        ]);
        const fullyCovered = zones.filter((z) => z.isFullyCovered).length;
        const withRedundancy = zones.filter((z) => z.hasRedundancy).length;
        const totalCamerasAssigned = zones.reduce((sum, z) => sum + z.assignedCameras.length, 0);
        const criticalZones = zones.filter((z) => z.priority === coverage_zone_schema_1.CoveragePriority.CRITICAL).length;
        return {
            total,
            byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            fullyCovered,
            withRedundancy,
            totalCamerasAssigned,
            criticalZones,
        };
    }
}
exports.CoverageZoneRepository = CoverageZoneRepository;
//# sourceMappingURL=coverage-zone.repository.js.map