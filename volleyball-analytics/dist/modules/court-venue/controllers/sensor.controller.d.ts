import { SensorService } from '../services/sensor.service';
import { CreateSensorDto, UpdateSensorDto } from '../dtos/sensor.dto';
export declare class SensorController {
    private readonly sensorService;
    constructor(sensorService: SensorService);
    createSensor(createSensorDto: CreateSensorDto): Promise<import("@shared/api-response").ApiResponse<any>>;
    getSensors(venueId?: string, courtId?: string, facilityId?: string, equipmentId?: string, sensorType?: string, status?: string, page?: number, limit?: number): Promise<import("@shared/api-response").PaginatedResponse<unknown>>;
    getSensorById(id: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    updateSensor(id: string, updateSensorDto: UpdateSensorDto): Promise<import("@shared/api-response").ApiResponse<any>>;
    updateSensorStatus(id: string, status: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    recordReading(id: string, reading: {
        value: number;
        unit: string;
        quality: string;
        metadata?: Record<string, unknown>;
    }): Promise<import("@shared/api-response").ApiResponse<any>>;
    recordCalibration(id: string, calibration: any): Promise<import("@shared/api-response").ApiResponse<any>>;
    updateBatteryLevel(id: string, level: number): Promise<import("@shared/api-response").ApiResponse<any>>;
    getSensorStats(venueId: string): Promise<import("@shared/api-response").ApiResponse<any>>;
}
//# sourceMappingURL=sensor.controller.d.ts.map