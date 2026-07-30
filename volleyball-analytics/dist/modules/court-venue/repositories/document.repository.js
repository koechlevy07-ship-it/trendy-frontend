"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const document_schema_1 = require("../schemas/document.schema");
class DocumentRepository extends base_repository_1.MongoRepository {
    constructor(model) {
        super(model);
    }
    async findByDocumentCode(documentCode) {
        return this.model.findOne({ documentCode: documentCode.toUpperCase() }).exec();
    }
    async findByVenue(venueId, pagination) {
        const query = this.model.find({ venueId: new mongoose_1.Types.ObjectId(venueId) }).sort({ category: 1, createdAt: -1 });
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
    async findByCertification(certificationId) {
        return this.model.find({ certificationId: new mongoose_1.Types.ObjectId(certificationId) }).exec();
    }
    async findByMaintenance(maintenanceId) {
        return this.model.find({ maintenanceId: new mongoose_1.Types.ObjectId(maintenanceId) }).exec();
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
    async findByAccessLevel(accessLevel, pagination) {
        const query = this.model.find({ accessLevel }).sort({ createdAt: -1 });
        if (pagination) {
            query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
        }
        return query.exec();
    }
    async findByTags(tags) {
        return this.model.find({ tags: { $in: tags.map(t => t.toLowerCase()) } }).exec();
    }
    async findExpiring(days = 30) {
        const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        return this.model
            .find({
            'metadata.expiryDate': { $lte: futureDate, $gte: new Date() },
            status: { $in: [document_schema_1.DocumentStatus.APPROVED, document_schema_1.DocumentStatus.PENDING_REVIEW] },
        })
            .sort({ 'metadata.expiryDate': 1 })
            .exec();
    }
    async findExpired() {
        return this.model
            .find({
            'metadata.expiryDate': { $lt: new Date() },
            status: { $in: [document_schema_1.DocumentStatus.APPROVED, document_schema_1.DocumentStatus.PENDING_REVIEW] },
        })
            .sort({ 'metadata.expiryDate': 1 })
            .exec();
    }
    async findPendingReview() {
        return this.model.find({ status: document_schema_1.DocumentStatus.PENDING_REVIEW }).sort({ createdAt: 1 }).exec();
    }
    async findByCreator(createdBy) {
        return this.model.find({ createdBy: new mongoose_1.Types.ObjectId(createdBy) }).sort({ createdAt: -1 }).exec();
    }
    async findApproved() {
        return this.model.find({ status: document_schema_1.DocumentStatus.APPROVED }).sort({ 'metadata.approvedAt': -1 }).exec();
    }
    async addVersion(id, version) {
        return this.model
            .findByIdAndUpdate(id, {
            $push: { versions: { $each: [{ ...this.currentVersion, isCurrent: false }], $position: 0 } },
            $set: { currentVersion: { ...version, isCurrent: true } },
        }, { new: true })
            .exec();
    }
    async approve(id, approvedBy) {
        return this.model
            .findByIdAndUpdate(id, {
            status: document_schema_1.DocumentStatus.APPROVED,
            'metadata.approvedAt': new Date(),
            'metadata.approvedBy': approvedBy,
        }, { new: true })
            .exec();
    }
    async reject(id, rejectedBy, reason) {
        return this.model
            .findByIdAndUpdate(id, {
            status: document_schema_1.DocumentStatus.REJECTED,
            'metadata.rejectedAt': new Date(),
            'metadata.rejectedBy': rejectedBy,
            'metadata.rejectionReason': reason,
        }, { new: true })
            .exec();
    }
    async archive(id) {
        return this.model.findByIdAndUpdate(id, { status: document_schema_1.DocumentStatus.ARCHIVED }, { new: true }).exec();
    }
    async supersede(id, newDocumentId) {
        return this.model
            .findByIdAndUpdate(id, { status: document_schema_1.DocumentStatus.SUPERSEDED, supersededBy: newDocumentId }, { new: true })
            .exec();
    }
    async addRelatedDocument(id, relatedId) {
        return this.model.findByIdAndUpdate(id, { $addToSet: { relatedDocuments: relatedId } }, { new: true }).exec();
    }
    async incrementDownloadCount(id, accessedBy) {
        return this.model
            .findByIdAndUpdate(id, {
            $inc: { downloadCount: 1 },
            $set: { lastAccessedAt: new Date(), lastAccessedBy: accessedBy },
        }, { new: true })
            .exec();
    }
    async getDocumentStats(venueId) {
        const match = venueId ? { venueId: new mongoose_1.Types.ObjectId(venueId) } : {};
        const now = new Date();
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const [total, byCategory, byStatus, byAccessLevel, approved, pendingReview, expired, expiringSoon, totalDownloads,] = await Promise.all([
            this.model.countDocuments(match),
            this.model.aggregate([{ $match: match }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
            this.model.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
            this.model.aggregate([{ $match: match }, { $group: { _id: '$accessLevel', count: { $sum: 1 } } }]),
            this.model.countDocuments({ ...match, status: document_schema_1.DocumentStatus.APPROVED }),
            this.model.countDocuments({ ...match, status: document_schema_1.DocumentStatus.PENDING_REVIEW }),
            this.model.countDocuments({
                ...match,
                'metadata.expiryDate': { $lt: now },
                status: { $in: [document_schema_1.DocumentStatus.APPROVED, document_schema_1.DocumentStatus.PENDING_REVIEW] },
            }),
            this.model.countDocuments({
                ...match,
                'metadata.expiryDate': { $lte: thirtyDaysFromNow, $gte: now },
                status: { $in: [document_schema_1.DocumentStatus.APPROVED, document_schema_1.DocumentStatus.PENDING_REVIEW] },
            }),
            this.model.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
        ]);
        return {
            total,
            byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            byAccessLevel: byAccessLevel.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
            approved,
            pendingReview,
            expired,
            expiringSoon,
            totalDownloads: totalDownloads[0]?.total || 0,
        };
    }
}
exports.DocumentRepository = DocumentRepository;
//# sourceMappingURL=document.repository.js.map