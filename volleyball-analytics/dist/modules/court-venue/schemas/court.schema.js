"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Court = exports.MaintenanceStatus = exports.CourtOrientation = exports.CourtStatus = exports.SurfaceType = exports.CourtType = void 0;
const mongoose_1 = require("mongoose");
var CourtType;
(function (CourtType) {
    CourtType["INDOOR_VOLLEYBALL"] = "indoor_volleyball";
    CourtType["BEACH_VOLLEYBALL"] = "beach_volleyball";
    CourtType["SITTING_VOLLEYBALL"] = "sitting_volleyball";
    CourtType["SNOW_VOLLEYBALL"] = "snow_volleyball";
    CourtType["GRASS_VOLLEYBALL"] = "grass_volleyball";
    CourtType["TRAINING"] = "training";
    CourtType["WARM_UP"] = "warm_up";
})(CourtType || (exports.CourtType = CourtType = {}));
var SurfaceType;
(function (SurfaceType) {
    SurfaceType["WOOD"] = "wood";
    SurfaceType["SYNTHETIC"] = "synthetic";
    SurfaceType["TARA"] = "tara";
    SurfaceType["CONCRETE"] = "concrete";
    SurfaceType["SAND"] = "sand";
    SurfaceType["GRASS"] = "grass";
    SurfaceType["SNOW"] = "snow";
    SurfaceType["MODULAR"] = "modular";
    SurfaceType["RUBBER"] = "rubber";
})(SurfaceType || (exports.SurfaceType = SurfaceType = {}));
var CourtStatus;
(function (CourtStatus) {
    CourtStatus["DRAFT"] = "draft";
    CourtStatus["REGISTERED"] = "registered";
    CourtStatus["ACTIVE"] = "active";
    CourtStatus["INACTIVE"] = "inactive";
    CourtStatus["MAINTENANCE"] = "maintenance";
    CourtStatus["SUSPENDED"] = "suspended";
    CourtStatus["ARCHIVED"] = "archived";
})(CourtStatus || (exports.CourtStatus = CourtStatus = {}));
var CourtOrientation;
(function (CourtOrientation) {
    CourtOrientation["NORTH_SOUTH"] = "north_south";
    CourtOrientation["EAST_WEST"] = "east_west";
    CourtOrientation["NORTHEAST_SOUTHWEST"] = "northeast_southwest";
    CourtOrientation["NORTHWEST_SOUTHEAST"] = "northwest_southeast";
})(CourtOrientation || (exports.CourtOrientation = CourtOrientation = {}));
var MaintenanceStatus;
(function (MaintenanceStatus) {
    MaintenanceStatus["NONE"] = "none";
    MaintenanceStatus["SCHEDULED"] = "scheduled";
    MaintenanceStatus["IN_PROGRESS"] = "in_progress";
    MaintenanceStatus["COMPLETED"] = "completed";
    MaintenanceStatus["OVERDUE"] = "overdue";
})(MaintenanceStatus || (exports.MaintenanceStatus = MaintenanceStatus = {}));
const CourtDimensionsSchema = new mongoose_1.Schema({ length: { type: Number, required: true, min: 10, max: 50 }, width: { type: Number, required: true, min: 10, max: 30 }, freeZoneLength: { type: Number, required: true, min: 2, max: 10 }, freeZoneWidth: { type: Number, required: true, min: 2, max: 10 }, netHeight: { type: Number, required: true, min: 1.5, max: 3 }, netHeightMen: { type: Number, min: 1.5, max: 3 }, netHeightWomen: { type: Number, min: 1.5, max: 3 }, poleDistance: { type: Number, min: 0.5, max: 5 }, antennaHeight: { type: Number, min: 0.5, max: 2 }, serviceZoneDepth: { type: Number, min: 1, max: 10 }, substitutionZoneLength: { type: Number, min: 1, max: 5 }, liberoZoneLength: { type: Number, min: 1, max: 5 } }, { _id: false });
const CourtEquipmentSchema = new mongoose_1.Schema({ netSystem: { type: { type: String, required: true }, manufacturer: { type: String, required: true }, model: { type: String, required: true }, serialNumber: { type: String }, lastInspection: { type: Date } }, posts: [{ type: { type: String, required: true }, manufacturer: { type: String, required: true }, model: { type: String, required: true }, serialNumber: { type: String }, lastInspection: { type: Date } }], antennae: [{ manufacturer: { type: String, required: true }, model: { type: String, required: true }, serialNumber: { type: String } }], scoreboard: { type: { type: String }, manufacturer: { type: String }, model: { type: String }, serialNumber: { type: String } }, lighting: { type: { type: String }, luxLevel: { type: Number }, manufacturer: { type: String } }, padding: { type: { type: String }, manufacturer: { type: String } } }, { _id: false });
const CourtSchema = new mongoose_1.Schema({
    venueId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Venue' }, courtCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 }, courtName: { type: String, required: true, trim: true, maxlength: 200 }, courtType: { type: String, enum: Object.values(CourtType), required: true }, surfaceType: { type: String, enum: Object.values(SurfaceType), required: true }, dimensions: { type: CourtDimensionsSchema, required: true }, orientation: { type: String, enum: Object.values(CourtOrientation), required: true }, status: { type: String, enum: Object.values(CourtStatus), default: CourtStatus.DRAFT }, equipment: { type: CourtEquipmentSchema, required: true }, cameraProfileId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CameraProfile' }, calibrationProfileId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CalibrationProfile' }, maintenanceStatus: { isUnderMaintenance: { type: Boolean, default: false }, maintenanceStartDate: { type: Date }, maintenanceEndDate: { type: Date }, maintenanceReason: { type: String }, scheduledMaintenance: [{ type: Date }] }, availability: { isBookable: { type: Boolean, default: true }, blockoutDates: [{ type: Date }], recurringBlockouts: [{ dayOfWeek: { type: Number, min: 0, max: 6 }, startTime: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ }, endTime: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ } }] }, aiConfiguration: { enabled: { type: Boolean, default: false }, trackingConfig: { type: mongoose_1.Schema.Types.Mixed }, detectionConfig: { type: mongoose_1.Schema.Types.Mixed }, actionRecognitionConfig: { type: mongoose_1.Schema.Types.Mixed } }, metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} }, activatedAt: { type: Date }, activatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, suspendedAt: { type: Date }, suspendedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, archivedAt: { type: Date }, archivedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, collection: 'courts' });
CourtSchema.index({ venueId: 1, courtCode: 1 }, { unique: true });
CourtSchema.index({ venueId: 1, status: 1 });
CourtSchema.index({ courtType: 1, surfaceType: 1 });
CourtSchema.index({ status: 1 });
CourtSchema.index({ cameraProfileId: 1 });
CourtSchema.index({ calibrationProfileId: 1 });
CourtSchema.pre('validate', function (next) { if (this.maintenanceStatus.isUnderMaintenance)
    this.availability.isBookable = false; if (this.status === CourtStatus.MAINTENANCE)
    this.maintenanceStatus.isUnderMaintenance = true; next(); });
exports.Court = mongoose_1.models.Court || (0, mongoose_1.model)('Court', CourtSchema);
//# sourceMappingURL=court.schema.js.map