import { Schema, Types, Document } from 'mongoose';
export declare enum CertificationType {
    VENUE_CERTIFICATION = "venue_certification",
    COURT_CERTIFICATION = "court_certification",
    EQUIPMENT_CERTIFICATION = "equipment_certification",
    SAFETY_CERTIFICATION = "safety_certification",
    FIRE_SAFETY = "fire_safety",
    STRUCTURAL_INTEGRITY = "structural_integrity",
    ELECTRICAL_SAFETY = "electrical_safety",
    ACCESSIBILITY = "accessibility",
    ENVIRONMENTAL = "environmental",
    AI_SYSTEM_CERTIFICATION = "ai_system_certification",
    CAMERA_CALIBRATION = "camera_calibration",
    OFFICIALS_CERTIFICATION = "officials_certification",
    MEDICAL_FACILITY = "medical_facility",
    BROADCAST_READY = "broadcast_ready",
    COMPETITION_LICENSE = "competition_license",
    OTHER = "other"
}
export declare enum CertificationStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    EXPIRED = "expired",
    REVOKED = "revoked",
    SUSPENDED = "suspended",
    RENEWAL_REQUIRED = "renewal_required"
}
export declare enum CertificationAuthority {
    FIVB = "fivb",
    CEV = "cev",
    NORCECA = "norceca",
    AVC = "avc",
    CSV = "csv",
    CAVB = "cavb",
    NATIONAL_FEDERATION = "national_federation",
    LOCAL_AUTHORITY = "local_authority",
    THIRD_PARTY = "third_party",
    INTERNAL = "internal"
}
export interface ICertificationRequirement {
    requirementId: string;
    description: string;
    isMandatory: boolean;
    evidenceRequired: boolean;
    evidenceType?: 'document' | 'photo' | 'video' | 'measurement' | 'test_result';
    status: 'pending' | 'submitted' | 'verified' | 'failed' | 'waived';
    evidence?: {
        type: string;
        url: string;
        submittedAt: Date;
        submittedBy: Types.ObjectId;
        verifiedAt?: Date;
        verifiedBy?: Types.ObjectId;
    };
}
export interface ICertificationInspection {
    inspectionId: string;
    scheduledDate: Date;
    completedDate?: Date;
    inspector: Types.ObjectId;
    inspectorName: string;
    inspectorOrganization: string;
    type: 'initial' | 'renewal' | 'surveillance' | 'special' | 'follow_up';
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
    findings: {
        requirementId: string;
        status: 'compliant' | 'non_compliant' | 'not_applicable' | 'observation';
        notes: string;
        evidence?: {
            type: string;
            url: string;
        }[];
    }[];
    overallResult: 'pass' | 'fail' | 'conditional_pass';
    reportUrl?: string;
    nextInspectionDue?: Date;
}
export interface ICertificationCondition {
    conditionId: string;
    description: string;
    dueDate: Date;
    status: 'open' | 'in_progress' | 'resolved' | 'overdue';
    resolutionNotes?: string;
    resolvedAt?: Date;
    resolvedBy?: Types.ObjectId;
}
export interface ICertification extends Document {
    venueId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    certificationCode: string;
    name: string;
    certificationType: CertificationType;
    status: CertificationStatus;
    issuingAuthority: CertificationAuthority;
    authorityName: string;
    authorityContact: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    certificateNumber: string;
    issuedDate: Date;
    effectiveDate: Date;
    expiryDate: Date;
    scope: string[];
    applicableStandards: string[];
    requirements: ICertificationRequirement[];
    inspections: ICertificationInspection[];
    conditions: ICertificationCondition[];
    documents: {
        documentId: string;
        name: string;
        type: string;
        url: string;
        uploadedAt: Date;
        uploadedBy: Types.ObjectId;
        isPublic: boolean;
    }[];
    fees: {
        applicationFee: number;
        inspectionFee: number;
        renewalFee: number;
        currency: string;
        paymentStatus: 'pending' | 'paid' | 'overdue' | 'waived';
        paidAt?: Date;
        invoiceNumber?: string;
    };
    renewal: {
        autoRenew: boolean;
        renewalWindowDays: number;
        lastRenewalDate?: Date;
        nextRenewalDate?: Date;
        renewalCount: number;
    };
    metadata: Record<string, unknown>;
    submittedBy: Types.ObjectId;
    reviewedBy?: Types.ObjectId;
    approvedBy?: Types.ObjectId;
    rejectedAt?: Date;
    rejectionReason?: string;
    revokedAt?: Date;
    revocationReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CertificationSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    collection: string;
}, {
    status: CertificationStatus;
    documents: Types.DocumentArray<{
        type: string;
        name: string;
        url: string;
        documentId: string;
        uploadedAt: NativeDate;
        uploadedBy: Types.ObjectId;
        isPublic: boolean;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        type: string;
        name: string;
        url: string;
        documentId: string;
        uploadedAt: NativeDate;
        uploadedBy: Types.ObjectId;
        isPublic: boolean;
    }> & {
        type: string;
        name: string;
        url: string;
        documentId: string;
        uploadedAt: NativeDate;
        uploadedBy: Types.ObjectId;
        isPublic: boolean;
    }>;
    metadata: any;
    name: string;
    certificateNumber: string;
    issuedDate: NativeDate;
    expiryDate: NativeDate;
    renewal: {
        autoRenew: boolean;
        renewalWindowDays: number;
        renewalCount: number;
        lastRenewalDate?: NativeDate;
        nextRenewalDate?: NativeDate;
    };
    submittedBy: Types.ObjectId;
    certificationCode: string;
    certificationType: CertificationType;
    issuingAuthority: CertificationAuthority;
    authorityName: string;
    effectiveDate: NativeDate;
    scope: string[];
    applicableStandards: string[];
    requirements: Types.DocumentArray<{
        status: "failed" | "pending" | "submitted" | "verified" | "waived";
        description: string;
        requirementId: string;
        isMandatory: boolean;
        evidenceRequired: boolean;
        evidenceType?: "document" | "photo" | "video" | "measurement" | "test_result";
        evidence?: {
            type?: string;
            url?: string;
            verifiedBy?: Types.ObjectId;
            verifiedAt?: NativeDate;
            submittedAt?: NativeDate;
            submittedBy?: Types.ObjectId;
        };
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "failed" | "pending" | "submitted" | "verified" | "waived";
        description: string;
        requirementId: string;
        isMandatory: boolean;
        evidenceRequired: boolean;
        evidenceType?: "document" | "photo" | "video" | "measurement" | "test_result";
        evidence?: {
            type?: string;
            url?: string;
            verifiedBy?: Types.ObjectId;
            verifiedAt?: NativeDate;
            submittedAt?: NativeDate;
            submittedBy?: Types.ObjectId;
        };
    }> & {
        status: "failed" | "pending" | "submitted" | "verified" | "waived";
        description: string;
        requirementId: string;
        isMandatory: boolean;
        evidenceRequired: boolean;
        evidenceType?: "document" | "photo" | "video" | "measurement" | "test_result";
        evidence?: {
            type?: string;
            url?: string;
            verifiedBy?: Types.ObjectId;
            verifiedAt?: NativeDate;
            submittedAt?: NativeDate;
            submittedBy?: Types.ObjectId;
        };
    }>;
    inspections: Types.DocumentArray<{
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
        type: "initial" | "renewal" | "surveillance" | "special" | "follow_up";
        scheduledDate: NativeDate;
        inspectionId: string;
        inspector: Types.ObjectId;
        inspectorName: string;
        inspectorOrganization: string;
        findings: Types.DocumentArray<{
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }> & {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }>;
        overallResult: "pass" | "fail" | "conditional_pass";
        completedDate?: NativeDate;
        reportUrl?: string;
        nextInspectionDue?: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
        type: "initial" | "renewal" | "surveillance" | "special" | "follow_up";
        scheduledDate: NativeDate;
        inspectionId: string;
        inspector: Types.ObjectId;
        inspectorName: string;
        inspectorOrganization: string;
        findings: Types.DocumentArray<{
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }> & {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }>;
        overallResult: "pass" | "fail" | "conditional_pass";
        completedDate?: NativeDate;
        reportUrl?: string;
        nextInspectionDue?: NativeDate;
    }> & {
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
        type: "initial" | "renewal" | "surveillance" | "special" | "follow_up";
        scheduledDate: NativeDate;
        inspectionId: string;
        inspector: Types.ObjectId;
        inspectorName: string;
        inspectorOrganization: string;
        findings: Types.DocumentArray<{
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }> & {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }>;
        overallResult: "pass" | "fail" | "conditional_pass";
        completedDate?: NativeDate;
        reportUrl?: string;
        nextInspectionDue?: NativeDate;
    }>;
    conditions: Types.DocumentArray<{
        status: "in_progress" | "overdue" | "open" | "resolved";
        description: string;
        conditionId: string;
        dueDate: NativeDate;
        resolutionNotes?: string;
        resolvedAt?: NativeDate;
        resolvedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "in_progress" | "overdue" | "open" | "resolved";
        description: string;
        conditionId: string;
        dueDate: NativeDate;
        resolutionNotes?: string;
        resolvedAt?: NativeDate;
        resolvedBy?: Types.ObjectId;
    }> & {
        status: "in_progress" | "overdue" | "open" | "resolved";
        description: string;
        conditionId: string;
        dueDate: NativeDate;
        resolutionNotes?: string;
        resolvedAt?: NativeDate;
        resolvedBy?: Types.ObjectId;
    }>;
    fees: {
        applicationFee: number;
        inspectionFee: number;
        renewalFee: number;
        currency: string;
        paymentStatus: "overdue" | "pending" | "waived" | "paid";
        paidAt?: NativeDate;
        invoiceNumber?: string;
    };
    venueId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    authorityContact?: {
        address: string;
        name: string;
        email: string;
        phone: string;
    };
    reviewedBy?: Types.ObjectId;
    approvedBy?: Types.ObjectId;
    rejectedAt?: NativeDate;
    rejectionReason?: string;
    revokedAt?: NativeDate;
    revocationReason?: string;
} & import("mongoose").DefaultTimestampProps, Document<unknown, {}, import("mongoose").FlatRecord<{
    status: CertificationStatus;
    documents: Types.DocumentArray<{
        type: string;
        name: string;
        url: string;
        documentId: string;
        uploadedAt: NativeDate;
        uploadedBy: Types.ObjectId;
        isPublic: boolean;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        type: string;
        name: string;
        url: string;
        documentId: string;
        uploadedAt: NativeDate;
        uploadedBy: Types.ObjectId;
        isPublic: boolean;
    }> & {
        type: string;
        name: string;
        url: string;
        documentId: string;
        uploadedAt: NativeDate;
        uploadedBy: Types.ObjectId;
        isPublic: boolean;
    }>;
    metadata: any;
    name: string;
    certificateNumber: string;
    issuedDate: NativeDate;
    expiryDate: NativeDate;
    renewal: {
        autoRenew: boolean;
        renewalWindowDays: number;
        renewalCount: number;
        lastRenewalDate?: NativeDate;
        nextRenewalDate?: NativeDate;
    };
    submittedBy: Types.ObjectId;
    certificationCode: string;
    certificationType: CertificationType;
    issuingAuthority: CertificationAuthority;
    authorityName: string;
    effectiveDate: NativeDate;
    scope: string[];
    applicableStandards: string[];
    requirements: Types.DocumentArray<{
        status: "failed" | "pending" | "submitted" | "verified" | "waived";
        description: string;
        requirementId: string;
        isMandatory: boolean;
        evidenceRequired: boolean;
        evidenceType?: "document" | "photo" | "video" | "measurement" | "test_result";
        evidence?: {
            type?: string;
            url?: string;
            verifiedBy?: Types.ObjectId;
            verifiedAt?: NativeDate;
            submittedAt?: NativeDate;
            submittedBy?: Types.ObjectId;
        };
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "failed" | "pending" | "submitted" | "verified" | "waived";
        description: string;
        requirementId: string;
        isMandatory: boolean;
        evidenceRequired: boolean;
        evidenceType?: "document" | "photo" | "video" | "measurement" | "test_result";
        evidence?: {
            type?: string;
            url?: string;
            verifiedBy?: Types.ObjectId;
            verifiedAt?: NativeDate;
            submittedAt?: NativeDate;
            submittedBy?: Types.ObjectId;
        };
    }> & {
        status: "failed" | "pending" | "submitted" | "verified" | "waived";
        description: string;
        requirementId: string;
        isMandatory: boolean;
        evidenceRequired: boolean;
        evidenceType?: "document" | "photo" | "video" | "measurement" | "test_result";
        evidence?: {
            type?: string;
            url?: string;
            verifiedBy?: Types.ObjectId;
            verifiedAt?: NativeDate;
            submittedAt?: NativeDate;
            submittedBy?: Types.ObjectId;
        };
    }>;
    inspections: Types.DocumentArray<{
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
        type: "initial" | "renewal" | "surveillance" | "special" | "follow_up";
        scheduledDate: NativeDate;
        inspectionId: string;
        inspector: Types.ObjectId;
        inspectorName: string;
        inspectorOrganization: string;
        findings: Types.DocumentArray<{
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }> & {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }>;
        overallResult: "pass" | "fail" | "conditional_pass";
        completedDate?: NativeDate;
        reportUrl?: string;
        nextInspectionDue?: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
        type: "initial" | "renewal" | "surveillance" | "special" | "follow_up";
        scheduledDate: NativeDate;
        inspectionId: string;
        inspector: Types.ObjectId;
        inspectorName: string;
        inspectorOrganization: string;
        findings: Types.DocumentArray<{
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }> & {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }>;
        overallResult: "pass" | "fail" | "conditional_pass";
        completedDate?: NativeDate;
        reportUrl?: string;
        nextInspectionDue?: NativeDate;
    }> & {
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
        type: "initial" | "renewal" | "surveillance" | "special" | "follow_up";
        scheduledDate: NativeDate;
        inspectionId: string;
        inspector: Types.ObjectId;
        inspectorName: string;
        inspectorOrganization: string;
        findings: Types.DocumentArray<{
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }> & {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }>;
        overallResult: "pass" | "fail" | "conditional_pass";
        completedDate?: NativeDate;
        reportUrl?: string;
        nextInspectionDue?: NativeDate;
    }>;
    conditions: Types.DocumentArray<{
        status: "in_progress" | "overdue" | "open" | "resolved";
        description: string;
        conditionId: string;
        dueDate: NativeDate;
        resolutionNotes?: string;
        resolvedAt?: NativeDate;
        resolvedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "in_progress" | "overdue" | "open" | "resolved";
        description: string;
        conditionId: string;
        dueDate: NativeDate;
        resolutionNotes?: string;
        resolvedAt?: NativeDate;
        resolvedBy?: Types.ObjectId;
    }> & {
        status: "in_progress" | "overdue" | "open" | "resolved";
        description: string;
        conditionId: string;
        dueDate: NativeDate;
        resolutionNotes?: string;
        resolvedAt?: NativeDate;
        resolvedBy?: Types.ObjectId;
    }>;
    fees: {
        applicationFee: number;
        inspectionFee: number;
        renewalFee: number;
        currency: string;
        paymentStatus: "overdue" | "pending" | "waived" | "paid";
        paidAt?: NativeDate;
        invoiceNumber?: string;
    };
    venueId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    authorityContact?: {
        address: string;
        name: string;
        email: string;
        phone: string;
    };
    reviewedBy?: Types.ObjectId;
    approvedBy?: Types.ObjectId;
    rejectedAt?: NativeDate;
    rejectionReason?: string;
    revokedAt?: NativeDate;
    revocationReason?: string;
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
    collection: string;
}>> & import("mongoose").FlatRecord<{
    status: CertificationStatus;
    documents: Types.DocumentArray<{
        type: string;
        name: string;
        url: string;
        documentId: string;
        uploadedAt: NativeDate;
        uploadedBy: Types.ObjectId;
        isPublic: boolean;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        type: string;
        name: string;
        url: string;
        documentId: string;
        uploadedAt: NativeDate;
        uploadedBy: Types.ObjectId;
        isPublic: boolean;
    }> & {
        type: string;
        name: string;
        url: string;
        documentId: string;
        uploadedAt: NativeDate;
        uploadedBy: Types.ObjectId;
        isPublic: boolean;
    }>;
    metadata: any;
    name: string;
    certificateNumber: string;
    issuedDate: NativeDate;
    expiryDate: NativeDate;
    renewal: {
        autoRenew: boolean;
        renewalWindowDays: number;
        renewalCount: number;
        lastRenewalDate?: NativeDate;
        nextRenewalDate?: NativeDate;
    };
    submittedBy: Types.ObjectId;
    certificationCode: string;
    certificationType: CertificationType;
    issuingAuthority: CertificationAuthority;
    authorityName: string;
    effectiveDate: NativeDate;
    scope: string[];
    applicableStandards: string[];
    requirements: Types.DocumentArray<{
        status: "failed" | "pending" | "submitted" | "verified" | "waived";
        description: string;
        requirementId: string;
        isMandatory: boolean;
        evidenceRequired: boolean;
        evidenceType?: "document" | "photo" | "video" | "measurement" | "test_result";
        evidence?: {
            type?: string;
            url?: string;
            verifiedBy?: Types.ObjectId;
            verifiedAt?: NativeDate;
            submittedAt?: NativeDate;
            submittedBy?: Types.ObjectId;
        };
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "failed" | "pending" | "submitted" | "verified" | "waived";
        description: string;
        requirementId: string;
        isMandatory: boolean;
        evidenceRequired: boolean;
        evidenceType?: "document" | "photo" | "video" | "measurement" | "test_result";
        evidence?: {
            type?: string;
            url?: string;
            verifiedBy?: Types.ObjectId;
            verifiedAt?: NativeDate;
            submittedAt?: NativeDate;
            submittedBy?: Types.ObjectId;
        };
    }> & {
        status: "failed" | "pending" | "submitted" | "verified" | "waived";
        description: string;
        requirementId: string;
        isMandatory: boolean;
        evidenceRequired: boolean;
        evidenceType?: "document" | "photo" | "video" | "measurement" | "test_result";
        evidence?: {
            type?: string;
            url?: string;
            verifiedBy?: Types.ObjectId;
            verifiedAt?: NativeDate;
            submittedAt?: NativeDate;
            submittedBy?: Types.ObjectId;
        };
    }>;
    inspections: Types.DocumentArray<{
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
        type: "initial" | "renewal" | "surveillance" | "special" | "follow_up";
        scheduledDate: NativeDate;
        inspectionId: string;
        inspector: Types.ObjectId;
        inspectorName: string;
        inspectorOrganization: string;
        findings: Types.DocumentArray<{
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }> & {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }>;
        overallResult: "pass" | "fail" | "conditional_pass";
        completedDate?: NativeDate;
        reportUrl?: string;
        nextInspectionDue?: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
        type: "initial" | "renewal" | "surveillance" | "special" | "follow_up";
        scheduledDate: NativeDate;
        inspectionId: string;
        inspector: Types.ObjectId;
        inspectorName: string;
        inspectorOrganization: string;
        findings: Types.DocumentArray<{
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }> & {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }>;
        overallResult: "pass" | "fail" | "conditional_pass";
        completedDate?: NativeDate;
        reportUrl?: string;
        nextInspectionDue?: NativeDate;
    }> & {
        status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
        type: "initial" | "renewal" | "surveillance" | "special" | "follow_up";
        scheduledDate: NativeDate;
        inspectionId: string;
        inspector: Types.ObjectId;
        inspectorName: string;
        inspectorOrganization: string;
        findings: Types.DocumentArray<{
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }> & {
            status: "compliant" | "non_compliant" | "not_applicable" | "observation";
            notes: string;
            requirementId: string;
            evidence: Types.DocumentArray<{
                type?: string;
                url?: string;
            }, Types.Subdocument<import("bson").ObjectId, any, {
                type?: string;
                url?: string;
            }> & {
                type?: string;
                url?: string;
            }>;
        }>;
        overallResult: "pass" | "fail" | "conditional_pass";
        completedDate?: NativeDate;
        reportUrl?: string;
        nextInspectionDue?: NativeDate;
    }>;
    conditions: Types.DocumentArray<{
        status: "in_progress" | "overdue" | "open" | "resolved";
        description: string;
        conditionId: string;
        dueDate: NativeDate;
        resolutionNotes?: string;
        resolvedAt?: NativeDate;
        resolvedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "in_progress" | "overdue" | "open" | "resolved";
        description: string;
        conditionId: string;
        dueDate: NativeDate;
        resolutionNotes?: string;
        resolvedAt?: NativeDate;
        resolvedBy?: Types.ObjectId;
    }> & {
        status: "in_progress" | "overdue" | "open" | "resolved";
        description: string;
        conditionId: string;
        dueDate: NativeDate;
        resolutionNotes?: string;
        resolvedAt?: NativeDate;
        resolvedBy?: Types.ObjectId;
    }>;
    fees: {
        applicationFee: number;
        inspectionFee: number;
        renewalFee: number;
        currency: string;
        paymentStatus: "overdue" | "pending" | "waived" | "paid";
        paidAt?: NativeDate;
        invoiceNumber?: string;
    };
    venueId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    authorityContact?: {
        address: string;
        name: string;
        email: string;
        phone: string;
    };
    reviewedBy?: Types.ObjectId;
    approvedBy?: Types.ObjectId;
    rejectedAt?: NativeDate;
    rejectionReason?: string;
    revokedAt?: NativeDate;
    revocationReason?: string;
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const Certification: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<ICertification, {}, {}, {}, Document<unknown, {}, ICertification, {}, {}> & ICertification & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=certification.schema.d.ts.map