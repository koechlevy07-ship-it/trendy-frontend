"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Certification = exports.CertificationSchema = exports.CertificationAuthority = exports.CertificationStatus = exports.CertificationType = void 0;
const mongoose_1 = require("mongoose");
var CertificationType;
(function (CertificationType) {
    CertificationType["VENUE_CERTIFICATION"] = "venue_certification";
    CertificationType["COURT_CERTIFICATION"] = "court_certification";
    CertificationType["EQUIPMENT_CERTIFICATION"] = "equipment_certification";
    CertificationType["SAFETY_CERTIFICATION"] = "safety_certification";
    CertificationType["FIRE_SAFETY"] = "fire_safety";
    CertificationType["STRUCTURAL_INTEGRITY"] = "structural_integrity";
    CertificationType["ELECTRICAL_SAFETY"] = "electrical_safety";
    CertificationType["ACCESSIBILITY"] = "accessibility";
    CertificationType["ENVIRONMENTAL"] = "environmental";
    CertificationType["AI_SYSTEM_CERTIFICATION"] = "ai_system_certification";
    CertificationType["CAMERA_CALIBRATION"] = "camera_calibration";
    CertificationType["OFFICIALS_CERTIFICATION"] = "officials_certification";
    CertificationType["MEDICAL_FACILITY"] = "medical_facility";
    CertificationType["BROADCAST_READY"] = "broadcast_ready";
    CertificationType["COMPETITION_LICENSE"] = "competition_license";
    CertificationType["OTHER"] = "other";
})(CertificationType || (exports.CertificationType = CertificationType = {}));
var CertificationStatus;
(function (CertificationStatus) {
    CertificationStatus["PENDING"] = "pending";
    CertificationStatus["IN_PROGRESS"] = "in_progress";
    CertificationStatus["UNDER_REVIEW"] = "under_review";
    CertificationStatus["APPROVED"] = "approved";
    CertificationStatus["REJECTED"] = "rejected";
    CertificationStatus["EXPIRED"] = "expired";
    CertificationStatus["REVOKED"] = "revoked";
    CertificationStatus["SUSPENDED"] = "suspended";
    CertificationStatus["RENEWAL_REQUIRED"] = "renewal_required";
})(CertificationStatus || (exports.CertificationStatus = CertificationStatus = {}));
var CertificationAuthority;
(function (CertificationAuthority) {
    CertificationAuthority["FIVB"] = "fivb";
    CertificationAuthority["CEV"] = "cev";
    CertificationAuthority["NORCECA"] = "norceca";
    CertificationAuthority["AVC"] = "avc";
    CertificationAuthority["CSV"] = "csv";
    CertificationAuthority["CAVB"] = "cavb";
    CertificationAuthority["NATIONAL_FEDERATION"] = "national_federation";
    CertificationAuthority["LOCAL_AUTHORITY"] = "local_authority";
    CertificationAuthority["THIRD_PARTY"] = "third_party";
    CertificationAuthority["INTERNAL"] = "internal";
})(CertificationAuthority || (exports.CertificationAuthority = CertificationAuthority = {}));
const CertificationRequirementSchema = new mongoose_1.Schema({ requirementId: { type: String, required: true }, description: { type: String, required: true, trim: true }, isMandatory: { type: Boolean, default: true }, evidenceRequired: { type: Boolean, default: false }, evidenceType: { type: String, enum: ['document', 'photo', 'video', 'measurement', 'test_result'] }, status: { type: String, enum: ['pending', 'submitted', 'verified', 'failed', 'waived'], default: 'pending' }, evidence: { type: { type: String }, url: { type: String }, submittedAt: { type: Date }, submittedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, verifiedAt: { type: Date }, verifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' } } }, { _id: false });
const CertificationInspectionSchema = new mongoose_1.Schema({ inspectionId: { type: String, required: true }, scheduledDate: { type: Date, required: true }, completedDate: { type: Date }, inspector: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' }, inspectorName: { type: String, required: true, trim: true }, inspectorOrganization: { type: String, required: true, trim: true }, type: { type: String, enum: ['initial', 'renewal', 'surveillance', 'special', 'follow_up'], required: true }, status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'], default: 'scheduled' }, findings: [{ requirementId: { type: String, required: true }, status: { type: String, enum: ['compliant', 'non_compliant', 'not_applicable', 'observation'], required: true }, notes: { type: String, required: true, trim: true }, evidence: [{ type: { type: String }, url: { type: String } }] }], overallResult: { type: String, enum: ['pass', 'fail', 'conditional_pass'], required: true }, reportUrl: { type: String }, nextInspectionDue: { type: Date } }, { _id: false });
const CertificationConditionSchema = new mongoose_1.Schema({ conditionId: { type: String, required: true }, description: { type: String, required: true, trim: true }, dueDate: { type: Date, required: true }, status: { type: String, enum: ['open', 'in_progress', 'resolved', 'overdue'], default: 'open' }, resolutionNotes: { type: String, trim: true }, resolvedAt: { type: Date }, resolvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' } }, { _id: false });
const CertificationDocumentSchema = new mongoose_1.Schema({ documentId: { type: String, required: true }, name: { type: String, required: true, trim: true }, type: { type: String, required: true, trim: true }, url: { type: String, required: true }, uploadedAt: { type: Date, default: Date.now }, uploadedBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' }, isPublic: { type: Boolean, default: false } }, { _id: false });
const CertificationFeesSchema = new mongoose_1.Schema({ applicationFee: { type: Number, default: 0, min: 0 }, inspectionFee: { type: Number, default: 0, min: 0 }, renewalFee: { type: Number, default: 0, min: 0 }, currency: { type: String, default: 'USD', uppercase: true, maxlength: 3 }, paymentStatus: { type: String, enum: ['pending', 'paid', 'overdue', 'waived'], default: 'pending' }, paidAt: { type: Date }, invoiceNumber: { type: String, trim: true } }, { _id: false });
const CertificationRenewalSchema = new mongoose_1.Schema({ autoRenew: { type: Boolean, default: false }, renewalWindowDays: { type: Number, default: 90, min: 1 }, lastRenewalDate: { type: Date }, nextRenewalDate: { type: Date }, renewalCount: { type: Number, default: 0, min: 0 } }, { _id: false });
const CertificationSchema = new mongoose_1.Schema({
    venueId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Venue' }, courtId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Court' }, equipmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Equipment' }, facilityId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Facility' },
    certificationCode: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    certificationType: { type: String, enum: Object.values(CertificationType), required: true },
    status: { type: String, enum: Object.values(CertificationStatus), default: CertificationStatus.PENDING },
    issuingAuthority: { type: String, enum: Object.values(CertificationAuthority), required: true },
    authorityName: { type: String, required: true, trim: true },
    authorityContact: { name: { type: String, required: true, trim: true }, email: { type: String, required: true, trim: true, lowercase: true }, phone: { type: String, required: true, trim: true }, address: { type: String, required: true, trim: true } },
    certificateNumber: { type: String, required: true, trim: true },
    issuedDate: { type: Date, required: true }, effectiveDate: { type: Date, required: true }, expiryDate: { type: Date, required: true },
    scope: [{ type: String, trim: true }], applicableStandards: [{ type: String, trim: true }],
    requirements: { type: [CertificationRequirementSchema], default: [] },
    inspections: { type: [CertificationInspectionSchema], default: [] },
    conditions: { type: [CertificationConditionSchema], default: [] },
    documents: { type: [CertificationDocumentSchema], default: [] },
    fees: { type: CertificationFeesSchema, default: {} },
    renewal: { type: CertificationRenewalSchema, default: {} },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    submittedBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date }, rejectionReason: { type: String, trim: true },
    revokedAt: { type: Date }, revocationReason: { type: String, trim: true },
}, { timestamps: true, collection: 'certifications' });
CertificationSchema.index({ venueId: 1, certificationType: 1 });
CertificationSchema.index({ courtId: 1, certificationType: 1 });
CertificationSchema.index({ equipmentId: 1, certificationType: 1 });
CertificationSchema.index({ facilityId: 1, certificationType: 1 });
CertificationSchema.index({ status: 1, expiryDate: 1 });
CertificationSchema.index({ certificateNumber: 1 });
CertificationSchema.index({ issuingAuthority: 1 });
CertificationSchema.index({ 'renewal.nextRenewalDate': 1 });
CertificationSchema.virtual('isExpired').get(function () { return this.expiryDate < new Date(); });
CertificationSchema.virtual('isExpiringSoon').get(function () { const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); return this.expiryDate <= thirtyDaysFromNow && this.expiryDate >= new Date(); });
CertificationSchema.virtual('daysUntilExpiry').get(function () { const diffTime = this.expiryDate.getTime() - Date.now(); return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); });
CertificationSchema.virtual('compliancePercentage').get(function () { if (this.requirements.length === 0)
    return 100; const verified = this.requirements.filter((r) => r.status === 'verified').length; const waived = this.requirements.filter((r) => r.status === 'waived').length; return Math.round(((verified + waived) / this.requirements.length) * 100); });
exports.CertificationSchema = CertificationSchema;
exports.Certification = mongoose_1.models.Certification || (0, mongoose_1.model)('Certification', CertificationSchema);
//# sourceMappingURL=certification.schema.js.map