"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoRepository = void 0;
const mongoose_1 = require("mongoose");
class MongoRepository {
    constructor(model) {
        this.model = model;
    }
    async findById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return this.model.findById(id).exec();
    }
    async findByIdOrThrow(id) {
        const doc = await this.findById(id);
        if (!doc)
            throw new Error(`${this.model.modelName} not found: ${id}`);
        return doc;
    }
    async findOne(filter) {
        return this.model.findOne(filter).exec();
    }
    async find(filter = {}, pagination) {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        const skip = (page - 1) * limit;
        const sort = pagination?.sortBy ? { [pagination.sortBy]: pagination.sortOrder === 'asc' ? 1 : -1 } : { createdAt: -1 };
        const [data, total] = await Promise.all([
            this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            this.model.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findAll(pagination) { return this.find({}, pagination); }
    async create(data) { const doc = new this.model(data); return doc.save(); }
    async update(id, data) {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return null;
        return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    }
    async delete(id) { if (!mongoose_1.Types.ObjectId.isValid(id))
        return false; const result = await this.model.findByIdAndDelete(id).exec(); return !!result; }
    async softDelete(id) { if (!mongoose_1.Types.ObjectId.isValid(id))
        return false; const result = await this.model.findByIdAndUpdate(id, { archivedAt: new Date(), status: 'archived' }, { new: true }).exec(); return !!result; }
    async restore(id) { if (!mongoose_1.Types.ObjectId.isValid(id))
        return false; const result = await this.model.findByIdAndUpdate(id, { archivedAt: null, status: 'active' }, { new: true }).exec(); return !!result; }
    async count(filter = {}) { return this.model.countDocuments(filter).exec(); }
    async exists(filter) { const doc = await this.model.findOne(filter).select('_id').lean().exec(); return !!doc; }
    async findByIds(ids) { const validIds = ids.filter(id => mongoose_1.Types.ObjectId.isValid(id)); if (validIds.length === 0)
        return []; return this.model.find({ _id: { $in: validIds } }).exec(); }
    async bulkCreate(docs) { return this.model.insertMany(docs); }
    async bulkUpdate(filter, update) { const result = await this.model.updateMany(filter, update).exec(); return { matched: result.matchedCount, modified: result.modifiedCount }; }
    async aggregate(pipeline) { return this.model.aggregate(pipeline).exec(); }
    async distinct(field, filter = {}) { return this.model.distinct(field, filter).exec(); }
}
exports.MongoRepository = MongoRepository;
//# sourceMappingURL=base.repository.js.map