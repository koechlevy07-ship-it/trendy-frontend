import { Model } from 'mongoose';
import { MongoRepository } from './base.repository';
import { ISensor, SensorType, SensorStatus, SensorUnit } from '../schemas/sensor.schema';
export declare class SensorRepository extends MongoRepository<ISensor> {
    constructor(model: Model<ISensor>);
    findBySensorId(sensorId: string): Promise<ISensor | null>;
    findByVenue(venueId: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<ISensor[]>;
    findByCourt(courtId: string): Promise<ISensor[]>;
    findByFacility(facilityId: string): Promise<ISensor[]>;
    findByEquipment(equipmentId: string): Promise<ISensor[]>;
    findByType(sensorType: SensorType, pagination?: {
        page: number;
        limit: number;
    }): Promise<ISensor[]>;
    findByStatus(status: SensorStatus, pagination?: {
        page: number;
        limit: number;
    }): Promise<ISensor[]>;
    findActive(): Promise<ISensor[]>;
    findBySerialNumber(serialNumber: string): Promise<ISensor | null>;
    findNeedingCalibration(): Promise<ISensor[]>;
    findCalibrationOverdue(): Promise<ISensor[]>;
    findByManufacturer(manufacturer: string): Promise<ISensor[]>;
    findOffline(): Promise<ISensor[]>;
    findWithDrift(): Promise<ISensor[]>;
    updateStatus(id: string, status: SensorStatus): Promise<ISensor | null>;
    recordReading(id: string, reading: {
        timestamp: Date;
        value: number;
        unit: SensorUnit;
        quality: 'good' | 'uncertain' | 'bad';
        metadata?: Record<string, unknown>;
    }): Promise<ISensor | null>;
    updateHealthMetrics(id: string, metrics: Partial<ISensor['healthMetrics']>): Promise<ISensor | null>;
    incrementErrorCount(id: string, error?: string): Promise<ISensor | null>;
    updateCalibration(id: string, calibration: Partial<ISensor['calibration']>): Promise<ISensor | null>;
    recordCalibration(id: string, calibration: ISensor['calibration']): Promise<ISensor | null>;
    updateBatteryLevel(id: string, level: number): Promise<ISensor | null>;
    getSensorStats(venueId: string): Promise<{
        total: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        active: number;
        calibrationDue: number;
        calibrationOverdue: number;
        offline: number;
        withDrift: number;
    }>;
}
//# sourceMappingURL=sensor.repository.d.ts.map