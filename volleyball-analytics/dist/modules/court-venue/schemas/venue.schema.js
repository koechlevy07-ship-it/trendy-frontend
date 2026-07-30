"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Venue = exports.VenueStatus = exports.VenueType = void 0;
const mongoose_1 = require("mongoose");
var VenueType;
(function (VenueType) {
    VenueType["INDOOR"] = "indoor";
    VenueType["OUTDOOR"] = "outdoor";
    VenueType["BEACH"] = "beach";
    VenueType["MIXED"] = "mixed";
    VenueType["MOBILE"] = "mobile";
})(VenueType || (exports.VenueType = VenueType = {}));
var VenueStatus;
(function (VenueStatus) {
    VenueStatus["DRAFT"] = "draft";
    VenueStatus["REGISTERED"] = "registered";
    VenueStatus["ACTIVE"] = "active";
    VenueStatus["SUSPENDED"] = "suspended";
    VenueStatus["UNDER_MAINTENANCE"] = "under_maintenance";
    VenueStatus["ARCHIVED"] = "archived";
    VenueStatus["DECOMMISSIONED"] = "decommissioned";
})(VenueStatus || (exports.VenueStatus = VenueStatus = {}));
const VenueAddressSchema = new mongoose_1.Schema({ street: { type: String, required: true, trim: true }, city: { type: String, required: true, trim: true }, state: { type: String, required: true, trim: true }, country: { type: String, required: true, trim: true }, postalCode: { type: String, required: true, trim: true } }, { _id: false });
const VenueContactSchema = new mongoose_1.Schema({ name: { type: String, required: true, trim: true }, role: { type: String, required: true, trim: true }, email: { type: String, required: true, trim: true, lowercase: true }, phone: { type: String, required: true, trim: true }, isPrimary: { type: Boolean, default: false } }, { _id: false });
const VenueOperatingHoursSchema = new mongoose_1.Schema({ dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, openTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ }, closeTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ }, isClosed: { type: Boolean, default: false } }, { _id: false });
const VenueSchema = new mongoose_1.Schema({
    venueName: { type: String, required: true, trim: true, maxlength: 200 },
    venueCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Organization' },
    venueType: { type: String, enum: Object.values(VenueType), required: true },
    status: { type: String, enum: Object.values(VenueStatus), default: VenueStatus.DRAFT },
    address: { type: VenueAddressSchema, required: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    capacity: { type: Number, required: true, min: 0 },
    operatingHours: { type: [VenueOperatingHoursSchema], default: [] },
    contacts: { type: [VenueContactSchema], default: [] },
    certificationRequired: { type: Boolean, default: false },
    certifications: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Certification' }],
    mediaAssets: { images: [{ type: String }], videos: [{ type: String }], documents: [{ type: String }] },
    documents: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Document' }],
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    suspendedAt: { type: Date }, suspendedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, suspendedReason: { type: String },
    activatedAt: { type: Date }, activatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    archivedAt: { type: Date }, archivedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, collection: 'venues' });
VenueSchema.index({ venueCode: 1 }, { unique: true });
VenueSchema.index({ organizationId: 1, venueName: 1 }, { unique: true });
VenueSchema.index({ status: 1 });
VenueSchema.index({ venueType: 1 });
VenueSchema.index({ latitude: 1, longitude: 1 });
VenueSchema.pre('save', function (next) {
    if (this.isNew) {
        const primaryContacts = this.contacts.filter((c) => c.isPrimary);
        if (primaryContacts.length > 1)
            return next(new Error('Only one primary contact allowed'));
    }
    next();
});
exports.Venue = mongoose_1.models.Venue || (0, mongoose_1.model)('Venue', VenueSchema);
//# sourceMappingURL=venue.schema.js.map