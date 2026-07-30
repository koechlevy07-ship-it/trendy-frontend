import { Model, Types } from 'mongoose';
import { MongoRepository } from './base.repository';
import { ICoverageZone, CoverageZoneType, CoveragePriority } from '../schemas/coverage-zone.schema';
export declare class CoverageZoneRepository extends MongoRepository<ICoverageZone> {
    constructor(model: Model<ICoverageZone>);
    findByZoneCode(courtId: string, zoneCode: string): Promise<ICoverageZone | null>;
    findByCourt(courtId: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICoverageZone[]>;
    findByType(zoneType: CoverageZoneType, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICoverageZone[]>;
    findByPriority(priority: CoveragePriority, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICoverageZone[]>;
    findByStatus(status: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICoverageZone[]>;
    findByCamera(cameraId: string): Promise<ICoverageZone[]>;
    findCriticalZones(courtId: string): Promise<ICoverageZone[]>;
    findActiveZones(courtId: string): Promise<ICoverageZone[]>;
    findZonesNeedingCalibration(): Promise<ICoverageZone[]>;
    findDegradedZones(): Promise<ICoverageZone[]>;
    assignCamera(id: string, cameraId: Types.ObjectId): Promise<ICoverageZone | null>;
    unassignCamera(id: string, cameraId: Types.ObjectId): Promise<ICoverageZone | null>;
    updateStatus(id: string, status: string): Promise<ICoverageZone | null>;
    updateMetrics(id: string, metrics: Partial<ICoverageZone['coverageMetrics']>): Promise<ICoverageZone | null>;
    setValidationResults(id: string, results: ICoverageZone['validationResults']): Promise<ICoverageZone | null>;
    recalculateMetrics(id: string): Promise<ICoverageZone | null>;
    getZoneStats(courtId: string): Promise<{
        total: number;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
        byStatus: Record<string, number>;
        fullyCovered: number;
        withRedundancy: number;
        totalCamerasAssigned: number;
        criticalZones: number;
    }>;
}
//# sourceMappingURL=coverage-zone.repository.d.ts.map