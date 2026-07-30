import { Model, Types } from 'mongoose';
import { MongoRepository } from './base.repository';
import { IEquipment, EquipmentStatus, EquipmentCategory, EquipmentCondition } from '../schemas/equipment.schema';
export declare class EquipmentRepository extends MongoRepository<IEquipment> {
    constructor(model: Model<IEquipment>);
    findByEquipmentCode(venueId: string, equipmentCode: string): Promise<IEquipment | null>;
    findBySerialNumber(serialNumber: string): Promise<IEquipment | null>;
    findByAssetTag(assetTag: string): Promise<IEquipment | null>;
    findByVenue(venueId: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<IEquipment[]>;
    findByCourt(courtId: string): Promise<IEquipment[]>;
    findByFacility(facilityId: string): Promise<IEquipment[]>;
    findByCategory(category: EquipmentCategory, pagination?: {
        page: number;
        limit: number;
    }): Promise<IEquipment[]>;
    findByStatus(status: EquipmentStatus, pagination?: {
        page: number;
        limit: number;
    }): Promise<IEquipment[]>;
    findAvailable(venueId: string): Promise<IEquipment[]>;
    findByCondition(condition: EquipmentCondition): Promise<IEquipment[]>;
    findByAssignedTo(userId: string): Promise<IEquipment[]>;
    findExpiringWarranty(days?: number): Promise<IEquipment[]>;
    findExpiringCertifications(days?: number): Promise<IEquipment[]>;
    findDueCalibration(): Promise<IEquipment[]>;
    findUnderMaintenance(): Promise<IEquipment[]>;
    assignEquipment(id: string, userId: Types.ObjectId, location?: string): Promise<IEquipment | null>;
    unassignEquipment(id: string): Promise<IEquipment | null>;
    setMaintenanceStatus(id: string, status: EquipmentStatus.MAINTENANCE | EquipmentStatus.REPAIR): Promise<IEquipment | null>;
    addMaintenanceRecord(id: string, record: Omit<IEquipmentMaintenance, 'totalCost'>): Promise<IEquipment | null>;
    addCertification(id: string, certification: IEquipmentCertification): Promise<IEquipment | null>;
    updateCertificationStatus(id: string, certificationIndex: number, status: 'valid' | 'expired' | 'expiring_soon' | 'revoked'): Promise<IEquipment | null>;
    addCalibrationRecord(id: string, record: {
        calibrationProfileId: Types.ObjectId;
        calibratedAt: Date;
        calibratedBy: Types.ObjectId;
        nextCalibrationDue: Date;
        status: 'passed' | 'failed' | 'conditional';
        notes?: string;
    }): Promise<IEquipment | null>;
    retireEquipment(id: string, reason: string): Promise<IEquipment | null>;
    getEquipmentStats(venueId: string): Promise<{
        total: number;
        byCategory: Record<string, number>;
        byStatus: Record<string, number>;
        byCondition: Record<string, number>;
        available: number;
        inUse: number;
        underMaintenance: number;
        retired: number;
        expiringWarranty: number;
        expiringCertifications: number;
        dueCalibration: number;
    }>;
}
//# sourceMappingURL=equipment.repository.d.ts.map