"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const venue_schema_1 = require("../schemas/venue.schema");
const venue_repository_1 = require("../repositories/venue.repository");
const business_validator_1 = require("../validators/business.validator");
const domain_events_1 = require("@shared/domain-events");
let VenueService = class VenueService {
    constructor(venueModel, venueRepository, businessValidator) {
        this.venueModel = venueModel;
        this.venueRepository = venueRepository;
        this.businessValidator = businessValidator;
    }
    async createVenue(createVenueDto, userId) {
        await this.businessValidator.validateVenueUniqueness(createVenueDto.venueCode, createVenueDto.organizationId, createVenueDto.venueName);
        const venue = new this.venueModel({
            ...createVenueDto,
            organizationId: new mongoose_2.Types.ObjectId(createVenueDto.organizationId),
            coordinates: { latitude: createVenueDto.latitude, longitude: createVenueDto.longitude },
            createdBy: new mongoose_2.Types.ObjectId(userId),
        });
        const savedVenue = await venue.save();
        await this.publishEvent('VenueCreated', savedVenue._id.toString(), 'Venue', { venueId: savedVenue._id.toString(), venueCode: savedVenue.venueCode, venueName: savedVenue.venueName, organizationId: savedVenue.organizationId.toString(), venueType: savedVenue.venueType, status: savedVenue.status }, { userId });
        return savedVenue;
    }
    async getVenues(searchDto) {
        const filter = {};
        if (searchDto.search)
            filter.$or = [{ venueName: { $regex: searchDto.search, $options: 'i' } }, { venueCode: { $regex: searchDto.search, $options: 'i' } }];
        if (searchDto.venueType)
            filter.venueType = searchDto.venueType;
        if (searchDto.status)
            filter.status = searchDto.status;
        if (searchDto.organizationId)
            filter.organizationId = new mongoose_2.Types.ObjectId(searchDto.organizationId);
        if (searchDto.latitude && searchDto.longitude) {
            const maxDistance = searchDto.radiusKm ? searchDto.radiusKm * 1000 : 50000;
            filter.coordinates = { $near: { $geometry: { type: 'Point', coordinates: [searchDto.longitude, searchDto.latitude] }, $maxDistance: maxDistance } };
        }
        const page = searchDto.page || 1;
        const limit = Math.min(searchDto.limit || 20, 100);
        const skip = (page - 1) * limit;
        const sort = { [searchDto.sortBy || 'createdAt']: searchDto.sortOrder === 'asc' ? 1 : -1 };
        const [data, total] = await Promise.all([
            this.venueModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            this.venueModel.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getVenueById(id) { return this.venueRepository.findByIdOrThrow(id); }
    async getVenueByCode(venueCode) { const venue = await this.venueRepository.findByVenueCode(venueCode); if (!venue)
        throw new common_1.NotFoundException('Venue not found'); return venue; }
    async updateVenue(id, updateVenueDto, userId) {
        const venue = await this.venueRepository.findByIdOrThrow(id);
        if (updateVenueDto.venueName && updateVenueDto.venueName !== venue.venueName) {
            await this.businessValidator.validateVenueUniqueness(venue.venueCode, venue.organizationId.toString(), updateVenueDto.venueName, id);
        }
        const updatedVenue = await this.venueRepository.update(id, { ...updateVenueDto, updatedBy: new mongoose_2.Types.ObjectId(userId) });
        await this.publishEvent('VenueUpdated', updatedVenue._id.toString(), 'Venue', { venueId: updatedVenue._id.toString(), changes: updateVenueDto }, { userId });
        return updatedVenue;
    }
    async activateVenue(id, activateDto) {
        const venue = await this.venueRepository.findByIdOrThrow(id);
        if (venue.status === venue_schema_1.VenueStatus.ACTIVE)
            throw new common_1.BadRequestException('Venue is already active');
        await this.businessValidator.validateVenueEligibility(id);
        const updatedVenue = await this.venueRepository.update(id, { status: venue_schema_1.VenueStatus.ACTIVE, activatedAt: new Date(), activatedBy: new mongoose_2.Types.ObjectId(activateDto.activatedBy) });
        await this.publishEvent('VenueActivated', updatedVenue._id.toString(), 'Venue', { venueId: updatedVenue._id.toString(), venueCode: updatedVenue.venueCode, activatedBy: activateDto.activatedBy }, { userId: activateDto.activatedBy });
        return updatedVenue;
    }
    async suspendVenue(id, suspendDto) {
        const venue = await this.venueRepository.findByIdOrThrow(id);
        if (venue.status === venue_schema_1.VenueStatus.SUSPENDED)
            throw new common_1.BadRequestException('Venue is already suspended');
        if (venue.status === venue_schema_1.VenueStatus.ARCHIVED)
            throw new common_1.BadRequestException('Cannot suspend an archived venue');
        const updatedVenue = await this.venueRepository.update(id, { status: venue_schema_1.VenueStatus.SUSPENDED, suspendedAt: new Date(), suspendedBy: new mongoose_2.Types.ObjectId(suspendDto.suspendedBy), suspendedReason: suspendDto.reason });
        await this.publishEvent('VenueSuspended', updatedVenue._id.toString(), 'Venue', { venueId: updatedVenue._id.toString(), venueCode: updatedVenue.venueCode, suspendedBy: suspendDto.suspendedBy, reason: suspendDto.reason }, { userId: suspendDto.suspendedBy });
        return updatedVenue;
    }
    async archiveVenue(id, userId) {
        const venue = await this.venueRepository.findByIdOrThrow(id);
        if (venue.status === venue_schema_1.VenueStatus.ARCHIVED)
            throw new common_1.BadRequestException('Venue is already archived');
        if (venue.status === venue_schema_1.VenueStatus.ACTIVE)
            throw new common_1.BadRequestException('Cannot archive an active venue. Suspend first.');
        const updatedVenue = await this.venueRepository.softDelete(id);
        await this.publishEvent('VenueArchived', updatedVenue._id.toString(), 'Venue', { venueId: updatedVenue._id.toString(), venueCode: updatedVenue.venueCode, archivedBy: userId }, { userId });
        return updatedVenue;
    }
    async restoreVenue(id, userId) {
        const venue = await this.venueRepository.findByIdOrThrow(id);
        if (venue.status !== venue_schema_1.VenueStatus.ARCHIVED)
            throw new common_1.BadRequestException('Venue is not archived');
        const updatedVenue = await this.venueRepository.restore(id);
        await this.publishEvent('VenueRestored', updatedVenue._id.toString(), 'Venue', { venueId: updatedVenue._id.toString(), venueCode: updatedVenue.venueCode, restoredBy: userId }, { userId });
        return updatedVenue;
    }
    async deleteVenue(id) { const venue = await this.venueRepository.findByIdOrThrow(id); await this.venueRepository.delete(id); }
    async getVenuesByOrganization(organizationId, page = 1, limit = 20) { return this.venueRepository.find({ organizationId: new mongoose_2.Types.ObjectId(organizationId) }, { page, limit }); }
    async getVenueStats(organizationId) { const [total, byType, byStatus, active] = await Promise.all([this.venueModel.countDocuments({ organizationId: new mongoose_2.Types.ObjectId(organizationId) }), this.venueModel.aggregate([{ $match: { organizationId: new mongoose_2.Types.ObjectId(organizationId) } }, { $group: { _id: '$venueType', count: { $sum: 1 } } }]), this.venueModel.aggregate([{ $match: { organizationId: new mongoose_2.Types.ObjectId(organizationId) } }, { $group: { _id: '$status', count: { $sum: 1 } } }]), this.venueModel.countDocuments({ organizationId: new mongoose_2.Types.ObjectId(organizationId), status: venue_schema_1.VenueStatus.ACTIVE }),]); return { total, byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), active }; }
    async publishEvent(eventType, aggregateId, aggregateType, payload, metadata) { const event = (0, domain_events_1.createDomainEvent)(eventType, aggregateId, aggregateType, payload, metadata); await domain_events_1.eventPublisher.publish(event); }
};
exports.VenueService = VenueService;
exports.VenueService = VenueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(venue_schema_1.Venue.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        venue_repository_1.VenueRepository,
        business_validator_1.BusinessValidator])
], VenueService);
//# sourceMappingURL=venue.service.js.map