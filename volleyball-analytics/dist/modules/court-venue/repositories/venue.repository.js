"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const venue_schema_1 = require("../schemas/venue.schema");
class VenueRepository extends base_repository_1.MongoRepository {
    constructor(model) { super(model); }
    async findByVenueCode(venueCode) { return this.model.findOne({ venueCode: venueCode.toUpperCase() }).exec(); }
    async findByOrganization(organizationId, pagination) { const query = this.model.find({ organizationId: new mongoose_1.Types.ObjectId(organizationId) }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findByOrganizationAndName(organizationId, venueName) { return this.model.findOne({ organizationId: new mongoose_1.Types.ObjectId(organizationId), venueName: { $regex: new RegExp(`^${venueName}$`, 'i') } }).exec(); }
    async findActiveByOrganization(organizationId) { return this.model.find({ organizationId: new mongoose_1.Types.ObjectId(organizationId), status: venue_schema_1.VenueStatus.ACTIVE }).sort({ venueName: 1 }).exec(); }
    async findByStatus(status, pagination) { const query = this.model.find({ status }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findNearby(longitude, latitude, maxDistanceKm = 50, pagination) { const query = this.model.find({ coordinates: { $near: { $geometry: { type: 'Point', coordinates: [longitude, latitude] }, $maxDistance: maxDistanceKm * 1000 } }, status: venue_schema_1.VenueStatus.ACTIVE }).sort({ createdAt: -1 }); if (pagination)
        query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit); return query.exec(); }
    async findRequiringCertification() { return this.model.find({ certificationRequired: true, $or: [{ certificationId: { $exists: false } }, { certificationId: null }] }).exec(); }
    async activateVenue(id, activatedBy) { return this.model.findByIdAndUpdate(id, { status: venue_schema_1.VenueStatus.ACTIVE, activatedAt: new Date(), activatedBy }, { new: true, runValidators: true }).exec(); }
    async suspendVenue(id, suspendedBy, reason) { return this.model.findByIdAndUpdate(id, { status: venue_schema_1.VenueStatus.SUSPENDED, suspendedAt: new Date(), suspendedBy, suspendedReason: reason }, { new: true, runValidators: true }).exec(); }
    async archiveVenue(id, archivedBy) { return this.model.findByIdAndUpdate(id, { status: venue_schema_1.VenueStatus.ARCHIVED, archivedAt: new Date(), archivedBy }, { new: true, runValidators: true }).exec(); }
    async restoreVenue(id) { return this.model.findByIdAndUpdate(id, { status: venue_schema_1.VenueStatus.DRAFT, archivedAt: null, archivedBy: null }, { new: true, runValidators: true }).exec(); }
    async addContact(id, contact) { return this.model.findByIdAndUpdate(id, { $push: { contacts: contact } }, { new: true, runValidators: true }).exec(); }
    async removeContact(id, contactIndex) { const venue = await this.model.findById(id); if (!venue)
        return null; venue.contacts.splice(contactIndex, 1); return venue.save(); }
    async updateContact(id, contactIndex, contact) { const venue = await this.model.findById(id); if (!venue)
        return null; venue.contacts[contactIndex] = { ...venue.contacts[contactIndex].toObject(), ...contact }; return venue.save(); }
    async setPrimaryContact(id, contactIndex) { const venue = await this.model.findById(id); if (!venue)
        return null; venue.contacts.forEach((c, i) => { c.isPrimary = i === contactIndex; }); return venue.save(); }
    async getVenueStats(organizationId) { const [total, active, suspended, archived, draft, byType] = await Promise.all([this.model.countDocuments({ organizationId: new mongoose_1.Types.ObjectId(organizationId) }), this.model.countDocuments({ organizationId: new mongoose_1.Types.ObjectId(organizationId), status: venue_schema_1.VenueStatus.ACTIVE }), this.model.countDocuments({ organizationId: new mongoose_1.Types.ObjectId(organizationId), status: venue_schema_1.VenueStatus.SUSPENDED }), this.model.countDocuments({ organizationId: new mongoose_1.Types.ObjectId(organizationId), status: venue_schema_1.VenueStatus.ARCHIVED }), this.model.countDocuments({ organizationId: new mongoose_1.Types.ObjectId(organizationId), status: venue_schema_1.VenueStatus.DRAFT }), this.model.aggregate([{ $match: { organizationId: new mongoose_1.Types.ObjectId(organizationId) } }, { $group: { _id: '$venueType', count: { $sum: 1 } } }]),]); return { total, active, suspended, archived, draft, byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}) }; }
}
exports.VenueRepository = VenueRepository;
//# sourceMappingURL=venue.repository.js.map