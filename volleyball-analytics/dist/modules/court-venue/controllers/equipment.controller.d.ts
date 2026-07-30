import { EquipmentService } from '../services/equipment.service';
import { CreateEquipmentDto, UpdateEquipmentDto } from '../dtos/equipment.dto';
export declare class EquipmentController {
    private readonly equipmentService;
    constructor(equipmentService: EquipmentService);
    createEquipment(createEquipmentDto: CreateEquipmentDto): Promise<import("@shared/api-response").ApiResponse<any>>;
    getEquipment(venueId?: string, category?: string, status?: string, condition?: string, page?: number, limit?: number): Promise<import("@shared/api-response").PaginatedResponse<unknown>>;
    getEquipmentById(id: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    updateEquipment(id: string, updateEquipmentDto: UpdateEquipmentDto): Promise<import("@shared/api-response").ApiResponse<any>>;
    assignEquipment(id: string, userId: string, location?: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    unassignEquipment(id: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    addMaintenanceRecord(id: string, maintenanceRecord: any): Promise<import("@shared/api-response").ApiResponse<any>>;
    addCertification(id: string, certification: any): Promise<import("@shared/api-response").ApiResponse<any>>;
    updateCertificationStatus(id: string, index: number, status: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    addCalibrationRecord(id: string, calibrationRecord: any): Promise<import("@shared/api-response").ApiResponse<any>>;
    retireEquipment(id: string, reason: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    getEquipmentStats(venueId: string): Promise<import("@shared/api-response").ApiResponse<any>>;
}
//# sourceMappingURL=equipment.controller.d.ts.map