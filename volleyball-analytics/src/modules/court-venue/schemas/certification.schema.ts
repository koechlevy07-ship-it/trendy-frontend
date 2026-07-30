import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum CertificationType { VENUE_CERTIFICATION = 'venue_certification', COURT_CERTIFICATION = 'court_certification', EQUIPMENT_CERTIFICATION = 'equipment_certification', SAFETY_CERTIFICATION = 'safety_certification', FIRE_SAFETY = 'fire_safety', STRUCTURAL_INTEGRITY = 'structural_integrity', ELECTRICAL_SAFETY = 'electrical_safety', ACCESSIBILITY = 'accessibility', ENVIRONMENTAL = 'environmental', AI_SYSTEM_CERTIFICATION = 'ai_system_certification', CAMERA_CALIBRATION = 'camera_calibration', OFFICIALS_CERTIFICATION = 'officials_certification', MEDICAL_FACILITY = 'medical_facility', BROADCAST_READY = 'broadcast_ready', COMPETITION_LICENSE = 'competition_license', OTHER = 'other' }
export enum CertificationStatus { PENDING = 'pending', IN_PROGRESS = 'in_progress', UNDER_REVIEW = 'under_review', APPROVED = 'approved', REJECTED = 'rejected', EXPIRED = 'expired', REVOKED = 'revoked', SUSPENDED = 'suspended', RENEWAL_REQUIRED = 'renewal_required' }
export enum CertificationAuthority { FIVB = 'fivb', CEV = 'cev', NORCECA = 'norceca', AVC = 'avc', CSV = 'csv', CAVB = 'cavb', NATIONAL_FEDERATION = 'national_federation', LOCAL_AUTHORITY = 'local_authority', THIRD_PARTY = 'third_party', INTERNAL = 'internal' }

export interface ICertificationRequirement { requirementId: string; description: string; isMandatory: boolean; evidenceRequired: boolean; evidenceType?: 'document' | 'photo' | 'video' | 'measurement' | 'test_result'; status: 'pending' | 'submitted' | 'verified' | 'failed' | 'waived'; evidence?: { type: string; url: string; submittedAt: Date; submittedBy: Types.ObjectId; verifiedAt?: Date; verifiedBy?: Types.ObjectId; }; }
export interface ICertificationInspection { inspectionId: string; scheduledDate: Date; completedDate?: Date; inspector: Types.ObjectId; inspectorName: string; inspectorOrganization: string; type: 'initial' | 'renewal' | 'surveillance' | 'special' | 'follow_up'; status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'; findings: { requirementId: string; status: 'compliant' | 'non_compliant' | 'not_applicable' | 'observation'; notes: string; evidence?: { type: string; url: string }[]; }[]; overallResult: 'pass' | 'fail' | 'conditional_pass'; reportUrl?: string; nextInspectionDue?: Date; }
export interface ICertificationCondition { conditionId: string; description: string; dueDate: Date; status: 'open' | 'in_progress' | 'resolved' | 'overdue'; resolutionNotes?: string; resolvedAt?: Date; resolvedBy?: Types.ObjectId; }

export interface ICertification extends Document {
  venueId?: Types.ObjectId; courtId?: Types.ObjectId; equipmentId?: Types.ObjectId; facilityId?: Types.ObjectId;
  certificationCode: string; name: string; certificationType: CertificationType;
  status: CertificationStatus; issuingAuthority: CertificationAuthority;
  authorityName: string; authorityContact: { name: string; email: string; phone: string; address: string; };
  certificateNumber: string; issuedDate: Date; effectiveDate: Date; expiryDate: Date;
  scope: string[]; applicableStandards: string[];
  requirements: ICertificationRequirement[]; inspections: ICertificationInspection[];
  conditions: ICertificationCondition[];
  documents: { documentId: string; name: string; type: string; url: string; uploadedAt: Date; uploadedBy: Types.ObjectId; isPublic: boolean; }[];
  fees: { applicationFee: number; inspectionFee: number; renewalFee: number; currency: string; paymentStatus: 'pending' | 'paid' | 'overdue' | 'waived'; paidAt?: Date; invoiceNumber?: string; };
  renewal: { autoRenew: boolean; renewalWindowDays: number; lastRenewalDate?: Date; nextRenewalDate?: Date; renewalCount: number; };
  metadata: Record<string, unknown>;
  submittedBy: Types.ObjectId; reviewedBy?: Types.ObjectId; approvedBy?: Types.ObjectId;
  rejectedAt?: Date; rejectionReason?: string; revokedAt?: Date; revocationReason?: string;
  createdAt: Date; updatedAt: Date;
}

const CertificationRequirementSchema = new Schema({ requirementId: { type: String, required: true }, description: { type: String, required: true, trim: true }, isMandatory: { type: Boolean, default: true }, evidenceRequired: { type: Boolean, default: false }, evidenceType: { type: String, enum: ['document', 'photo', 'video', 'measurement', 'test_result'] }, status: { type: String, enum: ['pending', 'submitted', 'verified', 'failed', 'waived'], default: 'pending' }, evidence: { type: { type: String }, url: { type: String }, submittedAt: { type: Date }, submittedBy: { type: Schema.Types.ObjectId, ref: 'User' }, verifiedAt: { type: Date }, verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' } } }, { _id: false });
const CertificationInspectionSchema = new Schema({ inspectionId: { type: String, required: true }, scheduledDate: { type: Date, required: true }, completedDate: { type: Date }, inspector: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, inspectorName: { type: String, required: true, trim: true }, inspectorOrganization: { type: String, required: true, trim: true }, type: { type: String, enum: ['initial', 'renewal', 'surveillance', 'special', 'follow_up'], required: true }, status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'], default: 'scheduled' }, findings: [{ requirementId: { type: String, required: true }, status: { type: String, enum: ['compliant', 'non_compliant', 'not_applicable', 'observation'], required: true }, notes: { type: String, required: true, trim: true }, evidence: [{ type: { type: String }, url: { type: String } }] }], overallResult: { type: String, enum: ['pass', 'fail', 'conditional_pass'], required: true }, reportUrl: { type: String }, nextInspectionDue: { type: Date } }, { _id: false });
const CertificationConditionSchema = new Schema({ conditionId: { type: String, required: true }, description: { type: String, required: true, trim: true }, dueDate: { type: Date, required: true }, status: { type: String, enum: ['open', 'in_progress', 'resolved', 'overdue'], default: 'open' }, resolutionNotes: { type: String, trim: true }, resolvedAt: { type: Date }, resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' } }, { _id: false });
const CertificationDocumentSchema = new Schema({ documentId: { type: String, required: true }, name: { type: String, required: true, trim: true }, type: { type: String, required: true, trim: true }, url: { type: String, required: true }, uploadedAt: { type: Date, default: Date.now }, uploadedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, isPublic: { type: Boolean, default: false } }, { _id: false });
const CertificationFeesSchema = new Schema({ applicationFee: { type: Number, default: 0, min: 0 }, inspectionFee: { type: Number, default: 0, min: 0 }, renewalFee: { type: Number, default: 0, min: 0 }, currency: { type: String, default: 'USD', uppercase: true, maxlength: 3 }, paymentStatus: { type: String, enum: ['pending', 'paid', 'overdue', 'waived'], default: 'pending' }, paidAt: { type: Date }, invoiceNumber: { type: String, trim: true } }, { _id: false });
const CertificationRenewalSchema = new Schema({ autoRenew: { type: Boolean, default: false }, renewalWindowDays: { type: Number, default: 90, min: 1 }, lastRenewalDate: { type: Date }, nextRenewalDate: { type: Date }, renewalCount: { type: Number, default: 0, min: 0 } }, { _id: false });

const CertificationSchema = new Schema(
  {
    venueId: { type: Schema.Types.ObjectId, ref: 'Venue' }, courtId: { type: Schema.Types.ObjectId, ref: 'Court' }, equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment' }, facilityId: { type: Schema.Types.ObjectId, ref: 'Facility' },
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
    metadata: { type: Schema.Types.Mixed, default: {} },
    submittedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' }, approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date }, rejectionReason: { type: String, trim: true },
    revokedAt: { type: Date }, revocationReason: { type: String, trim: true },
  },
  { timestamps: true, collection: 'certifications' }
);

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
CertificationSchema.virtual('compliancePercentage').get(function () { if (this.requirements.length === 0) return 100; const verified = this.requirements.filter((r) => r.status === 'verified').length; const waived = this.requirements.filter((r) => r.status === 'waived').length; return Math.round(((verified + waived) / this.requirements.length) * 100); });

export const CertificationSchema = CertificationSchema;
export const Certification = models.Certification || model<ICertification>('Certification', CertificationSchema);








