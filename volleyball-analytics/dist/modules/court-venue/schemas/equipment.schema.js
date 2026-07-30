"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Equipment = exports.EquipmentSchema = exports.EquipmentCondition = exports.EquipmentStatus = exports.EquipmentCategory = void 0;
const mongoose_1 = require("mongoose");
var EquipmentCategory;
(function (EquipmentCategory) {
    EquipmentCategory["NET_SYSTEM"] = "net_system";
    EquipmentCategory["POSTS"] = "posts";
    EquipmentCategory["ANTENNAS"] = "antennas";
    EquipmentCategory["SCOREBOARD"] = "scoreboard";
    EquipmentCategory["REFEREE_STAND"] = "referee_stand";
    EquipmentCategory["LIGHTING"] = "lighting";
    EquipmentCategory["FLOORING"] = "flooring";
    EquipmentCategory["BALLS"] = "balls";
    EquipmentCategory["BALL_CART"] = "ball_cart";
    EquipmentCategory["NET_HEIGHT_GAUGE"] = "net_height_gauge";
    EquipmentCategory["MEASURING_TAPE"] = "measuring_tape";
    EquipmentCategory["COURT_LINE_MARKER"] = "court_line_marker";
    EquipmentCategory["SAND_RAKE"] = "sand_rake";
    EquipmentCategory["WATER_REMOVAL"] = "water_removal";
    EquipmentCategory["FIRST_AID"] = "first_aid";
    EquipmentCategory["AED"] = "aed";
    EquipmentCategory["ICE_MACHINE"] = "ice_machine";
    EquipmentCategory["TRAINING_AIDS"] = "training_aids";
    EquipmentCategory["VIDEO_REPLAY"] = "video_replay";
    EquipmentCategory["COMMUNICATION"] = "communication";
    EquipmentCategory["TIMING_SYSTEM"] = "timing_system";
    EquipmentCategory["STATISTICS_SYSTEM"] = "statistics_system";
    EquipmentCategory["CAMERA_SYSTEM"] = "camera_system";
    EquipmentCategory["CALIBRATION_TOOLS"] = "calibration_tools";
    EquipmentCategory["MAINTENANCE_TOOLS"] = "maintenance_tools";
    EquipmentCategory["CLEANING_EQUIPMENT"] = "cleaning_equipment";
    EquipmentCategory["SAFETY_EQUIPMENT"] = "safety_equipment";
    EquipmentCategory["OTHER"] = "other";
})(EquipmentCategory || (exports.EquipmentCategory = EquipmentCategory = {}));
var EquipmentStatus;
(function (EquipmentStatus) {
    EquipmentStatus["AVAILABLE"] = "available";
    EquipmentStatus["IN_USE"] = "in_use";
    EquipmentStatus["MAINTENANCE"] = "maintenance";
    EquipmentStatus["REPAIR"] = "repair";
    EquipmentStatus["CALIBRATION"] = "calibration";
    EquipmentStatus["INSPECTION"] = "inspection";
    EquipmentStatus["RETIRED"] = "retired";
    EquipmentStatus["LOST"] = "lost";
    EquipmentStatus["DAMAGED"] = "damaged";
    EquipmentStatus["RESERVED"] = "reserved";
})(EquipmentStatus || (exports.EquipmentStatus = EquipmentStatus = {}));
var EquipmentCondition;
(function (EquipmentCondition) {
    EquipmentCondition["NEW"] = "new";
    EquipmentCondition["EXCELLENT"] = "excellent";
    EquipmentCondition["GOOD"] = "good";
    EquipmentCondition["FAIR"] = "fair";
    EquipmentCondition["POOR"] = "poor";
    EquipmentCondition["UNUSABLE"] = "unusable";
})(EquipmentCondition || (exports.EquipmentCondition = EquipmentCondition = {}));
const EquipmentSpecificationsSchema = new mongoose_1.Schema({ dimensions: { length: { type: Number }, width: { type: Number }, height: { type: Number }, unit: { type: String, default: 'cm' } }, weight: { value: { type: Number }, unit: { type: String, default: 'kg' } }, material: [{ type: String }], color: { type: String }, powerRequirements: { voltage: { type: Number }, amperage: { type: Number }, phase: { type: String }, connectorType: { type: String } }, operatingTemperature: { min: { type: Number }, max: { type: Number }, unit: { type: String, default: 'celsius' } }, certifications: [{ type: String }], customSpecs: { type: mongoose_1.Schema.Types.Mixed } }, { _id: false });
const EquipmentMaintenanceSchema = new mongoose_1.Schema({ scheduledDate: { type: Date, required: true }, completedDate: { type: Date }, type: { type: String, enum: ['preventive', 'corrective', 'calibration', 'inspection', 'cleaning'], required: true }, description: { type: String, required: true, trim: true }, performedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, cost: { type: Number, min: 0 }, partsReplaced: [{ type: String }], notes: { type: String, trim: true }, nextMaintenanceDate: { type: Date }, status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'overdue', 'cancelled'], default: 'scheduled' } }, { _id: false });
const EquipmentCertificationSchema = new mongoose_1.Schema({ name: { type: String, required: true, trim: true }, issuingBody: { type: String, required: true, trim: true }, certificateNumber: { type: String, required: true, trim: true }, issuedDate: { type: Date, required: true }, expiryDate: { type: Date, required: true }, status: { type: String, enum: ['valid', 'expired', 'expiring_soon', 'revoked'], default: 'valid' }, documentUrl: { type: String }, verifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, verifiedAt: { type: Date } }, { _id: false });
const EquipmentSchema = new mongoose_1.Schema({
    venueId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Venue' },
    courtId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Court' },
    facilityId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Facility' },
    equipmentCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, enum: Object.values(EquipmentCategory), required: true },
    manufacturer: { type: String, required: true, trim: true, maxlength: 100 },
    model: { type: String, required: true, trim: true, maxlength: 100 },
    serialNumber: { type: String, required: true, trim: true },
    assetTag: { type: String, trim: true, unique: true, sparse: true },
    specifications: { type: EquipmentSpecificationsSchema, default: {} },
    status: { type: String, enum: Object.values(EquipmentStatus), default: EquipmentStatus.AVAILABLE },
    condition: { type: String, enum: Object.values(EquipmentCondition), default: EquipmentCondition.GOOD },
    purchaseDate: { type: Date }, purchaseCost: { type: Number, min: 0 }, warrantyExpiry: { type: Date },
    expectedLifespanMonths: { type: Number, min: 1 },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    location: { type: String, trim: true, maxlength: 200 },
    maintenanceHistory: { type: [EquipmentMaintenanceSchema], default: [] },
    certifications: { type: [EquipmentCertificationSchema], default: [] },
    calibrationRecords: [{ calibrationProfileId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CalibrationProfile' }, calibratedAt: { type: Date, required: true }, calibratedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }, nextCalibrationDue: { type: Date, required: true }, status: { type: String, enum: ['passed', 'failed', 'conditional'], required: true }, notes: { type: String } }],
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    retiredAt: { type: Date }, retiredReason: { type: String, trim: true },
}, { timestamps: true, collection: 'equipment' });
EquipmentSchema.index({ venueId: 1, equipmentCode: 1 }, { unique: true });
EquipmentSchema.index({ venueId: 1, category: 1 });
EquipmentSchema.index({ venueId: 1, status: 1 });
EquipmentSchema.index({ serialNumber: 1 });
EquipmentSchema.index({ assetTag: 1 });
EquipmentSchema.index({ courtId: 1 });
EquipmentSchema.index({ facilityId: 1 });
EquipmentSchema.index({ assignedTo: 1 });
EquipmentSchema.index({ 'certifications.expiryDate': 1 });
EquipmentSchema.virtual('isUnderMaintenance').get(function () { return this.status === EquipmentStatus.MAINTENANCE || this.status === EquipmentStatus.REPAIR; });
EquipmentSchema.virtual('isAvailable').get(function () { return this.status === EquipmentStatus.AVAILABLE; });
EquipmentSchema.virtual('certificationsExpiringSoon').get(function () { const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); return this.certifications.filter((cert) => cert.status === 'valid' && cert.expiryDate <= thirtyDaysFromNow); });
exports.EquipmentSchema = EquipmentSchema;
exports.Equipment = mongoose_1.models.Equipment || (0, mongoose_1.model)('Equipment', EquipmentSchema);
//# sourceMappingURL=equipment.schema.js.map