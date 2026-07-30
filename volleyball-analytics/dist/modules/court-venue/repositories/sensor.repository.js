"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const sensor_schema_1 = require("../schemas/sensor.schema");
class SensorRepository extends base_repository_1.MongoRepository {
    constructor(model) {
        super(model);
    }
    async findBySensorId(sensorId) {
        return this.model.findOne({ sensorId: sensorId.toUpperCase() }).exec();
    }
    async findByVenue(venueId, pagination) {
        const query = this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId) }).sort({ sensorType: 1, name: 1 });
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
    async findByEquipment(equipmentId) {
        return this.model.find({ equipmentId: new mongoose_1.Types.ObjectId(equipmentId) }).exec();
    }
    async findByType(sensorType, pagination) {
        const query = this.model.find({ sensorType }).sort({ createdAt: -1 });
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
    async findActive() {
        return this.model.find({ status: sensor_schema_1.SensorStatus.ACTIVE }).exec();
    }
    async findBySerialNumber(serialNumber) {
        return this.model.findOne({ serialNumber }).exec();
    }
    async findNeedingCalibration() {
        const now = new Date();
        return this.model
            .find({
            status: sensor_schema_1.SensorStatus.ACTIVE,
            'calibration.nextCalibrationDue': { $lte: now },
        })
            .sort({ 'calibration.nextCalibrationDue': 1 })
            .exec();
    }
    async findCalibrationOverdue() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return this.model
            .find({
            status: sensor_schema_1.SensorStatus.ACTIVE,
            'calibration.nextCalibrationDue': { $lt: sevenDaysAgo },
        })
            .sort({ 'calibration.nextCalibrationDue': 1 })
            .exec();
    }
    async findByManufacturer(manufacturer) {
        return this.model.find({ manufacturer: new RegExp(manufacturer, 'i') }).exec();
    }
    async findOffline() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return this.model
            .find({
            status: sensor_schema_1.SensorStatus.ACTIVE,
            'healthMetrics.lastReading': { $lt: fiveMinutesAgo },
        })
            .exec();
    }
    async findWithDrift() {
        return this.model.find({ 'healthMetrics.driftDetected': true }).exec();
    }
    async updateStatus(id, status) {
        return this.model.findByIdAndUpdate(id, { status }, { new: true }).exec();
    }
    async recordReading(id, reading) {
        return this.model
            .findByIdAndUpdate(id, {
            $push: { readings: reading },
            $set: {
                'healthMetrics.lastReading': reading.timestamp,
                'healthMetrics.readingCount': { $inc: 1 },
            },
        }, { new: true })
            .exec();
    }
    async updateHealthMetrics(id, metrics) {
        return this.model.findByIdAndUpdate(id, { $set: { healthMetrics: metrics } }, { new: true }).exec();
    }
    async incrementErrorCount(id, error) {
        const update = { $inc: { 'healthMetrics.errorCount': 1 } };
        if (error)
            update.$set = { 'healthMetrics.lastError': error };
        return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    }
    async updateCalibration(id, calibration) {
        return this.model.findByIdAndUpdate(id, { $set: { calibration } }, { new: true }).exec();
    }
    async recordCalibration(id, calibration) {
        return this.model
            .findByIdAndUpdate(id, {
            $set: { calibration },
            $inc: { 'healthMetrics.readingCount': 0 },
        }, { new: true })
            .exec();
    }
    async updateBatteryLevel(id, level) {
        return this.model
            .findByIdAndUpdate(id, { $set: { 'powerSource.batteryLevel': level } }, { new: true })
            .exec();
    }
    async getSensorStats(venueId) {
        const [total, byType, byStatus, active, calibrationDue, calibrationOverdue, offline, withDrift,] = await Promise.all([
            this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId) }),
            this.model.aggregate([
                { $match: { venueId: new mongoose_1.Types.ObjectId(venueId) } },
                { $group: { _id: '$sensorType', count: { $sum: 1 } } },
            ]),
            this.model.aggregate([
                { $match: { venueId: new mongoose_1.Types.ObjectId(venueId) } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId), status: sensor_schema_1.SensorStatus.ACTIVE }),
            this.model.countDocuments({
                venueId: new mongoose_1.Types.ObjectId(venueId),
                status: sensor_schema_1.SensorStatus.ACTIVE,
                'calibration.nextCalibrationDue': { $lte: new Date() },
            }),
            this.model.countDocuments({
                venueId: new mongoose_1.Types.ObjectId(venueId),
                status: sensor_schema_1.SensorStatus.ACTIVE,
                'calibration.nextCalibrationDue': { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            }),
            this.model.countDocuments({
                venueId: new mongoose_1.Types.ObjectId(venueId),
                status: sensor_schema_1.SensorStatus.ACTIVE,
                'healthMetrics.lastReading': { $lt: new Date(Date.now() - 5 * 60 * 1000) },
            }),
            this.model.countDocuments({ venueId: new mongoose_1.Types.ObjectId(venueId), 'healthMetrics.driftDetected': true }),
        ]);
        return {
            total,
            byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            active,
            calibrationDue,
            calibrationOverdue,
            offline,
            withDrift,
        };
    }
}
exports.SensorRepository = SensorRepository;
//# sourceMappingURL=sensor.repository.js.map