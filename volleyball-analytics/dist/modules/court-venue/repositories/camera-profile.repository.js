"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraProfileRepository = void 0;
const base_repository_1 = require("./base.repository");
class CameraProfileRepository extends base_repository_1.MongoRepository {
    constructor(model) {
        super(model);
    }
    async findByProfileCode(profileCode) {
        return this.model.findOne({ profileCode: profileCode.toUpperCase() }).exec();
    }
    async findByType(profileType, pagination) {
        const query = this.model.find({ profileType, isActive: true }).sort({ name: 1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findByManufacturer(manufacturer, model) {
        return this.model.find({
            manufacturer: new RegExp(manufacturer, 'i'),
            model: new RegExp(model, 'i'),
            isActive: true,
        }).exec();
    }
    async findDefault() {
        return this.model.findOne({ isDefault: true, isActive: true }).exec();
    }
    async findByInferenceDevice(device) {
        return this.model
            .find({
            'aiConfiguration.inferenceDevice': device,
            isActive: true,
        })
            .exec();
    }
    async findByModel(modelName) {
        return this.model
            .find({
            $or: [
                { 'aiConfiguration.detectionModel': modelName },
                { 'aiConfiguration.trackingModel': modelName },
                { 'aiConfiguration.poseModel': modelName },
                { 'aiConfiguration.actionRecognitionModel': modelName },
                { 'aiConfiguration.ballTrackingModel': modelName },
                { 'aiConfiguration.jerseyDetectionModel': modelName },
            ],
            isActive: true,
        })
            .exec();
    }
    async setAsDefault(id) {
        await this.model.updateMany({ isDefault: true }, { isDefault: false });
        return this.model.findByIdAndUpdate(id, { isDefault: true }, { new: true }).exec();
    }
    async activate(id) {
        return this.model.findByIdAndUpdate(id, { isActive: true }, { new: true }).exec();
    }
    async deactivate(id) {
        const profile = await this.model.findById(id);
        if (profile?.isDefault) {
            throw new Error('Cannot deactivate default profile');
        }
        return this.model.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
    }
    async updateAICConfiguration(id, config) {
        return this.model
            .findByIdAndUpdate(id, { $set: { aiConfiguration: config } }, { new: true })
            .exec();
    }
    async updateDefaultSettings(id, settings) {
        return this.model
            .findByIdAndUpdate(id, { $set: { defaultSettings: settings } }, { new: true })
            .exec();
    }
    async incrementVersion(id) {
        return this.model
            .findByIdAndUpdate(id, { $inc: { version: 1 } }, { new: true })
            .exec();
    }
    async getProfileStats() {
        const [total, byType, active, inactive, withAI, byInferenceDevice] = await Promise.all([
            this.model.countDocuments(),
            this.model.aggregate([
                { $group: { _id: '$profileType', count: { $sum: 1 } } },
            ]),
            this.model.countDocuments({ isActive: true }),
            this.model.countDocuments({ isActive: false }),
            this.model.countDocuments({
                $or: [
                    { 'aiConfiguration.detectionModel': { $exists: true } },
                    { 'aiConfiguration.trackingModel': { $exists: true } },
                    { 'aiConfiguration.poseModel': { $exists: true } },
                    { 'aiConfiguration.actionRecognitionModel': { $exists: true } },
                    { 'aiConfiguration.ballTrackingModel': { $exists: true } },
                    { 'aiConfiguration.jerseyDetectionModel': { $exists: true } },
                ],
            }),
            this.model.aggregate([
                { $match: { 'aiConfiguration.inferenceDevice': { $exists: true } } },
                { $group: { _id: '$aiConfiguration.inferenceDevice', count: { $sum: 1 } } },
            ]),
        ]);
        return {
            total,
            byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            active,
            inactive,
            withAI,
            byInferenceDevice: byInferenceDevice.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        };
    }
}
exports.CameraProfileRepository = CameraProfileRepository;
//# sourceMappingURL=camera-profile.repository.js.map