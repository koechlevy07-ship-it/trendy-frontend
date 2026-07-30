import { Types, Document } from 'mongoose';
export declare enum DocumentCategory {
    VENUE_PLAN = "venue_plan",
    COURT_LAYOUT = "court_layout",
    CERTIFICATE = "certificate",
    INSPECTION_REPORT = "inspection_report",
    MAINTENANCE_LOG = "maintenance_log",
    CALIBRATION_REPORT = "calibration_report",
    SAFETY_AUDIT = "safety_audit",
    FIRE_CERTIFICATE = "fire_certificate",
    STRUCTURAL_CERTIFICATE = "structural_certificate",
    ELECTRICAL_CERTIFICATE = "electrical_certificate",
    ACCESSIBILITY_CERTIFICATE = "accessibility_certificate",
    ENVIRONMENTAL_CERTIFICATE = "environmental_certificate",
    INSURANCE = "insurance",
    PERMIT = "permit",
    LICENSE = "license",
    CONTRACT = "contract",
    WARRANTY = "warranty",
    MANUAL = "manual",
    SPECIFICATION = "specification",
    DRAWING = "drawing",
    PHOTO = "photo",
    VIDEO = "video",
    OTHER = "other"
}
export declare enum DocumentStatus {
    DRAFT = "draft",
    PENDING_REVIEW = "pending_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    EXPIRED = "expired",
    ARCHIVED = "archived",
    SUPERSEDED = "superseded"
}
export declare enum DocumentAccessLevel {
    PUBLIC = "public",
    ORGANIZATION = "organization",
    VENUE = "venue",
    COURT = "court",
    RESTRICTED = "restricted",
    CONFIDENTIAL = "confidential"
}
export interface IDocumentVersion {
    version: number;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    checksum: string;
    uploadedAt: Date;
    uploadedBy: Types.ObjectId;
    changesSummary: string;
    isCurrent: boolean;
}
export interface IDocument extends Document {
    documentCode: string;
    title: string;
    description?: string;
    category: DocumentCategory;
    status: DocumentStatus;
    accessLevel: DocumentAccessLevel;
    venueId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    certificationId?: Types.ObjectId;
    maintenanceId?: Types.ObjectId;
    currentVersion: IDocumentVersion;
    versions: IDocumentVersion[];
    tags: string[];
    metadata: {
        author?: string;
        department?: string;
        project?: string;
        confidentiality?: string;
        retentionPeriodDays?: number;
        expiryDate?: Date;
        reviewDate?: Date;
        approvedAt?: Date;
        approvedBy?: Types.ObjectId;
        rejectedAt?: Date;
        rejectedBy?: Types.ObjectId;
        rejectionReason?: string;
    };
    relatedDocuments: Types.ObjectId[];
    supersededBy?: Types.ObjectId;
    supersedes?: Types.ObjectId;
    downloadCount: number;
    lastAccessedAt?: Date;
    lastAccessedBy?: Types.ObjectId;
    retentionPolicy: {
        retainUntil: Date;
        autoArchive: boolean;
        autoDelete: boolean;
        legalHold: boolean;
    };
    metadata: Record<string, unknown>;
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const $1Schema: any;
export declare const Document: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<IDocument, {}, {}, {}, Document<unknown, {}, IDocument, {}, {}> & IDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=document.schema.d.ts.map