import { Model, Types } from 'mongoose';
import { MongoRepository } from './base.repository';
import { IDocument, DocumentCategory, DocumentStatus, DocumentAccessLevel } from '../schemas/document.schema';
export declare class DocumentRepository extends MongoRepository<IDocument> {
    constructor(model: Model<IDocument>);
    findByDocumentCode(documentCode: string): Promise<IDocument | null>;
    findByVenue(venueId: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<IDocument[]>;
    findByCourt(courtId: string): Promise<IDocument[]>;
    findByFacility(facilityId: string): Promise<IDocument[]>;
    findByEquipment(equipmentId: string): Promise<IDocument[]>;
    findByCertification(certificationId: string): Promise<IDocument[]>;
    findByMaintenance(maintenanceId: string): Promise<IDocument[]>;
    findByCategory(category: DocumentCategory, pagination?: {
        page: number;
        limit: number;
    }): Promise<IDocument[]>;
    findByStatus(status: DocumentStatus, pagination?: {
        page: number;
        limit: number;
    }): Promise<IDocument[]>;
    findByAccessLevel(accessLevel: DocumentAccessLevel, pagination?: {
        page: number;
        limit: number;
    }): Promise<IDocument[]>;
    findByTags(tags: string[]): Promise<IDocument[]>;
    findExpiring(days?: number): Promise<IDocument[]>;
    findExpired(): Promise<IDocument[]>;
    findPendingReview(): Promise<IDocument[]>;
    findByCreator(createdBy: string): Promise<IDocument[]>;
    findApproved(): Promise<IDocument[]>;
    addVersion(id: string, version: Omit<IDocument['currentVersion'], 'isCurrent'> & {
        isCurrent: true;
    }): Promise<IDocument | null>;
    approve(id: string, approvedBy: Types.ObjectId): Promise<IDocument | null>;
    reject(id: string, rejectedBy: Types.ObjectId, reason: string): Promise<IDocument | null>;
    archive(id: string): Promise<IDocument | null>;
    supersede(id: string, newDocumentId: Types.ObjectId): Promise<IDocument | null>;
    addRelatedDocument(id: string, relatedId: Types.ObjectId): Promise<IDocument | null>;
    incrementDownloadCount(id: string, accessedBy: Types.ObjectId): Promise<IDocument | null>;
    getDocumentStats(venueId?: string): Promise<{
        total: number;
        byCategory: Record<string, number>;
        byStatus: Record<string, number>;
        byAccessLevel: Record<string, number>;
        approved: number;
        pendingReview: number;
        expired: number;
        expiringSoon: number;
        totalDownloads: number;
    }>;
}
//# sourceMappingURL=document.repository.d.ts.map