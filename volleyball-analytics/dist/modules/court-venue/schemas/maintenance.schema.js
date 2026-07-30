"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceRecord = exports.MaintenanceRecordSchema = exports.MaintenancePriority = exports.MaintenanceStatus = exports.MaintenanceType = void 0;
const mongoose_1 = require("mongoose");
var MaintenanceType;
(function (MaintenanceType) {
    MaintenanceType["PREVENTIVE"] = "preventive";
    MaintenanceType["CORRECTIVE"] = "corrective";
    MaintenanceType["PREDICTIVE"] = "predictive";
    MaintenanceType["CALIBRATION"] = "calibration";
    MaintenanceType["INSPECTION"] = "inspection";
    MaintenanceType["CLEANING"] = "cleaning";
    MaintenanceType["UPGRADE"] = "upgrade";
    MaintenanceType["REPLACEMENT"] = "replacement";
    MaintenanceType["EMERGENCY"] = "emergency";
    MaintenanceType["WARRANTY"] = "warranty";
})(MaintenanceType || (exports.MaintenanceType = MaintenanceType = {}));
var MaintenanceStatus;
(function (MaintenanceStatus) {
    MaintenanceStatus["SCHEDULED"] = "scheduled";
    MaintenanceStatus["ASSIGNED"] = "assigned";
    MaintenanceStatus["IN_PROGRESS"] = "in_progress";
    MaintenanceStatus["ON_HOLD"] = "on_hold";
    MaintenanceStatus["COMPLETED"] = "completed";
    MaintenanceStatus["CANCELLED"] = "cancelled";
    MaintenanceStatus["OVERDUE"] = "overdue";
    MaintenanceStatus["REQUIRES_FOLLOWUP"] = "requires_followup";
})(MaintenanceStatus || (exports.MaintenanceStatus = MaintenanceStatus = {}));
var MaintenancePriority;
(function (MaintenancePriority) {
    MaintenancePriority["LOW"] = "low";
    MaintenancePriority["MEDIUM"] = "medium";
    MaintenancePriority["HIGH"] = "high";
    MaintenancePriority["CRITICAL"] = "critical";
    MaintenancePriority["EMERGENCY"] = "emergency";
})(MaintenancePriority || (exports.MaintenancePriority = MaintenancePriority = {}));
const MaintenanceChecklistItemSchema = new mongoose_1.Schema({
    itemId: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    isRequired: { type: Boolean, default: true },
    status: { type: String, enum: ['pending', 'completed', 'skipped', 'failed'], default: 'pending' },
    completedAt: { type: Date },
    completedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
    evidence: [{ type: { type: String }, url: { type: String } }],
}, { _id: false });
const MaintenancePartSchema = new mongoose_1.Schema({ partId: { type: String, required: true }, name: { type: String, required: true, trim: true }, partNumber: { type: String, required: true, trim: true }, quantity: { type: Number, required: true, min: 1 }, unitCost: { type: Number, required: true, min: 0 }, totalCost: { type: Number, required: true, min: 0 }, supplier: { type: String, trim: true }, warrantyExpiry: { type: Date }, notes: { type: String, trim: true } }, { _id: false });
const MaintenanceLaborSchema = new mongoose_1.Schema({ technicianId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' }, technicianName: { type: String, required: true, trim: true }, role: { type: String, required: true, trim: true }, hoursWorked: { type: Number, required: true, min: 0 }, hourlyRate: { type: Number, required: true, min: 0 }, totalCost: { type: Number, required: true, min: 0 }, tasksPerformed: [{ type: String, trim: true }] }, { _id: false });
const MaintenanceCostBreakdownSchema = new mongoose_1.Schema({ partsCost: { type: Number, default: 0, min: 0 }, laborCost: { type: Number, default: 0, min: 0 }, externalServiceCost: { type: Number, default: 0, min: 0 }, otherCost: { type: Number, default: 0, min: 0 } }, { _id: false });
const MaintenanceSignatureSchema = new mongoose_1.Schema({ technicianId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' }, technicianName: { type: String, required: true, trim: true }, signedAt: { type: Date, required: true, default: Date.now }, signatureData: { type: String } }, { _id: false });
const MaintenanceApprovalSchema = new mongoose_1.Schema({ approvedBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' }, approvedAt: { type: Date, required: true, default: Date.now }, version: { type: Number, required: true, min: 1 }, comments: { type: String, trim: true } }, { _id: false });
const MaintenanceRecordSchema = new mongoose_1.Schema({
    maintenanceCode: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 50 },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    maintenanceType: { type: String, enum: Object.values(MaintenanceType), required: true },
    status: { type: String, enum: Object.values(MaintenanceStatus), default: MaintenanceStatus.SCHEDULED },
    priority: { type: String, enum: Object.values(MaintenancePriority), default: MaintenancePriority.MEDIUM },
    venueId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Venue' },
    courtId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Court' },
    facilityId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Facility' },
    equipmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Equipment' },
    sensorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Sensor' },
    cameraId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Camera' },
    calibrationProfileId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CalibrationProfile' },
    scheduledDate: { type: Date, required: true },
    estimatedDurationMinutes: { type: Number, required: true, min: 1 },
    actualStartDate: { type: Date },
    actualEndDate: { type: Date },
    actualDurationMinutes: { type: Number, min: 0 },
    assignedTechnicianId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    assignedTechnicianName: { type: String, trim: true },
    supervisingEngineerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    checklist: { type: [MaintenanceChecklistItemSchema], default: [] },
    partsUsed: { type: [MaintenancePartSchema], default: [] },
    labor: { type: [MaintenanceLaborSchema], default: [] },
    totalCost: { type: Number, default: 0, min: 0 },
    costBreakdown: { type: MaintenanceCostBreakdownSchema, default: {} },
    findings: { type: String, trim: true, maxlength: 10000 },
    recommendations: [{ type: String, trim: true }],
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
    followUpDescription: { type: String, trim: true },
    documents: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Document' }],
    photos: [{ type: String }],
    signatures: { technicianId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' }, technicianName: { type: String, required: true, trim: true }, signedAt: { type: Date, required: true, default: Date.now }, signatureData: { type: String } },
    approvals: { approvedBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' }, approvedAt: { type: Date, required: true, default: Date.now }, version: { type: Number, required: true, min: 1 }, comments: { type: String, trim: true } },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, collection: 'maintenance_records' });
MaintenanceRecordSchema.index({ venueId: 1, status: 1 });
MaintenanceRecordSchema.index({ courtId: 1, status: 1 });
MaintenanceRecordSchema.index({ facilityId: 1, status: 1 });
MaintenanceRecordSchema.index({ equipmentId: 1, status: 1 });
MaintenanceRecordSchema.index({ sensorId: 1, status: 1 });
MaintenanceRecordSchema.index({ cameraId: 1, status: 1 });
MaintenanceRecordSchema.index({ calibrationProfileId: 1, status: 1 });
MaintenanceRecordSchema.index({ scheduledDate: 1, status: 1 });
MaintenanceRecordSchema.index({ assignedTechnicianId: 1, status: 1 });
MaintenanceRecordSchema.index({ maintenanceType: 1, status: 1 });
MaintenanceRecordSchema.index({ priority: 1, status: 1 });
MaintenanceRecordSchema.index({ followUpDate: 1 });
MaintenanceRecordSchema.index({ maintenanceCode: 1 }, { unique: true });
MaintenanceRecordSchema.virtual('isOverdue').get(function () { return this.status === MaintenanceStatus.SCHEDULED && this.scheduledDate < new Date(); });
MaintenanceRecordSchema.virtual('isCompleted').get(function () { return this.status === MaintenanceStatus.COMPLETED; });
MaintenanceRecordSchema.virtual('completionPercentage').get(function () { if (this.checklist.length === 0)
    return 100; const completed = this.checklist.filter((item) => item.status === 'completed').length; return Math.round((completed / this.checklist.length) * 100); });
MaintenanceRecordSchema.virtual('durationVariance').get(function () { if (!this.actualDurationMinutes)
    return null; return this.actualDurationMinutes - this.estimatedDurationMinutes; });
MaintenanceRecordSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === MaintenanceStatus.IN_PROGRESS && !this.actualStartDate)
        this.actualStartDate = new Date();
    if (this.isModified('status') && this.status === MaintenanceStatus.COMPLETED && !this.actualEndDate) {
        this.actualEndDate = new Date();
        if (this.actualStartDate)
            this.actualDurationMinutes = Math.round((this.actualEndDate.getTime() - this.actualStartDate.getTime()) / (1000 * 60));
    }
    if (this.isModified('partsUsed') || this.isModified('labor')) {
        const partsCost = this.partsUsed.reduce((sum, p) => sum + p.totalCost, 0);
        const laborCost = this.labor.reduce((sum, l) => sum + l.totalCost, 0);
        this.costBreakdown = { partsCost, laborCost, externalServiceCost: this.costBreakdown?.externalServiceCost || 0, otherCost: this.costBreakdown?.otherCost || 0 };
        this.totalCost = partsCost + laborCost + (this.costBreakdown.externalServiceCost || 0) + (this.costBreakdown.otherCost || 0);
    }
    next();
});
MaintenanceRecordSchema.methods.startWork = function (technicianId, technicianName) { this.status = MaintenanceStatus.IN_PROGRESS; this.actualStartDate = new Date(); this.assignedTechnicianId = technicianId; this.assignedTechnicianName = technicianName; return this.save(); };
MaintenanceRecordSchema.methods.completeWork = function (findings, recommendations) { this.status = MaintenanceStatus.COMPLETED; this.actualEndDate = new Date(); if (this.actualStartDate)
    this.actualDurationMinutes = Math.round((this.actualEndDate.getTime() - this.actualStartDate.getTime()) / (1000 * 60)); this.findings = findings; this.recommendations = recommendations; return this.save(); };
MaintenanceRecordSchema.methods.cancelWork = function (reason) { this.status = MaintenanceStatus.CANCELLED; this.findings = reason; return this.save(); };
MaintenanceRecordSchema.methods.addChecklistItem = function (item) { this.checklist.push({ itemId: item.itemId || `ITEM_${Date.now()}`, description: item.description || '', isRequired: item.isRequired !== false, status: 'pending' }); return this.save(); };
MaintenanceRecordSchema.methods.completeChecklistItem = function (itemId, completedBy, status, notes, evidence) { const item = this.checklist.find((i) => i.itemId === itemId); if (item) {
    item.status = status;
    item.completedAt = new Date();
    item.completedBy = completedBy;
    item.notes = notes;
    item.evidence = evidence;
} return this.save(); };
MaintenanceRecordSchema.methods.addPart = function (part) { this.partsUsed.push({ ...part, totalCost: part.quantity * part.unitCost }); return this.save(); };
MaintenanceRecordSchema.methods.addLabor = function (labor) { this.labor.push({ ...labor, totalCost: labor.hoursWorked * labor.hourlyRate }); return this.save(); };
MaintenanceRecordSchema.methods.signOff = function (technicianId, technicianName, signatureData) { this.signatures.push({ technicianId, technicianName, signedAt: new Date(), signatureData }); return this.save(); };
MaintenanceRecordSchema.methods.requestApproval = function (approvedBy, comments) { this.approvals.push({ approvedBy, approvedAt: new Date(), version: this.approvals.length + 1, comments }); return this.save(); };
exports.MaintenanceRecordSchema = MaintenanceRecordSchema;
exports.MaintenanceRecord = mongoose_1.models.MaintenanceRecord || (0, mongoose_1.model)('MaintenanceRecord', MaintenanceRecordSchema);
//# sourceMappingURL=maintenance.schema.js.map