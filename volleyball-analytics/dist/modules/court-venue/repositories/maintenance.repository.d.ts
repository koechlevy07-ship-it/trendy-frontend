import { Model, Types } from 'mongoose';
import { MongoRepository } from './base.repository';
import { IMaintenanceRecord, MaintenanceType, MaintenanceStatus, MaintenancePriority } from '../schemas/maintenance.schema';
export declare class MaintenanceRepository extends MongoRepository<IMaintenanceRecord> {
    constructor(model: Model<IMaintenanceRecord>);
    findByMaintenanceCode(maintenanceCode: string): Promise<IMaintenanceRecord | null>;
    findByVenue(venueId: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<IMaintenanceRecord[]>;
    findByCourt(courtId: string): Promise<IMaintenanceRecord[]>;
    findByFacility(facilityId: string): Promise<IMaintenanceRecord[]>;
    findByEquipment(equipmentId: string): Promise<IMaintenanceRecord[]>;
    findBySensor(sensorId: string): Promise<IMaintenanceRecord[]>;
    findByCamera(cameraId: string): Promise<IMaintenanceRecord[]>;
    findByCalibrationProfile(calibrationProfileId: string): Promise<IMaintenanceRecord[]>;
    findByType(maintenanceType: MaintenanceType, pagination?: {
        page: number;
        limit: number;
    }): Promise<IMaintenanceRecord[]>;
    findByStatus(status: MaintenanceStatus, pagination?: {
        page: number;
        limit: number;
    }): Promise<IMaintenanceRecord[]>;
    findByPriority(priority: MaintenancePriority, pagination?: {
        page: number;
        limit: number;
    }): Promise<IMaintenanceRecord[]>;
    findScheduledForDate(date: Date): Promise<IMaintenanceRecord[]>;
    findOverdue(): Promise<IMaintenanceRecord[]>;
    findByTechnician(technicianId: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<IMaintenanceRecord[]>;
    findRequiringFollowUp(): Promise<IMaintenanceRecord[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<IMaintenanceRecord[]>;
    startMaintenance(id: string, technicianId: Types.ObjectId, technicianName: string): Promise<IMaintenanceRecord | null>;
    completeMaintenance(id: string, findings: string, recommendations: string[], followUpRequired: boolean, followUpDate?: Date, followUpDescription?: string): Promise<IMaintenanceRecord | null>;
    cancelMaintenance(id: string, reason: string): Promise<IMaintenanceRecord | null>;
    addChecklistItem(id: string, item: Omit<IMaintenanceRecord['checklist'][0], 'totalCost'>): Promise<IMaintenanceRecord | null>;
    updateChecklistItem(id: string, itemId: string, updates: Partial<IMaintenanceRecord['checklist'][0]>): Promise<IMaintenanceRecord | null>;
    completeChecklistItem(id: string, itemId: string, completedBy: Types.ObjectId, status: 'completed' | 'skipped' | 'failed', notes?: string, evidence?: {
        type: string;
        url: string;
    }[]): Promise<IMaintenanceRecord | null>;
    addPart(id: string, part: Omit<IMaintenanceRecord['partsUsed'][0], 'totalCost'>): Promise<IMaintenanceRecord | null>;
    addLabor(id: string, labor: Omit<IMaintenanceRecord['labor'][0], 'totalCost'>): Promise<IMaintenanceRecord | null>;
    addDocument(id: string, documentId: Types.ObjectId): Promise<IMaintenanceRecord | null>;
    addPhoto(id: string, photoUrl: string): Promise<IMaintenanceRecord | null>;
    signOff(id: string, technicianId: Types.ObjectId, technicianName: string, signatureData?: string): Promise<IMaintenanceRecord | null>;
    requestApproval(id: string, approvedBy: Types.ObjectId, comments?: string): Promise<IMaintenanceRecord | null>;
    getMaintenanceStats(venueId?: string): Promise<{
        total: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        scheduled: number;
        inProgress: number;
        completed: number;
        overdue: number;
        totalCost: number;
        avgCost: number;
        avgDuration: number;
    }>;
}
//# sourceMappingURL=maintenance.repository.d.ts.map