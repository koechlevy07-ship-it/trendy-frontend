import { FacilityService } from '../services/facility.service';
import { CreateFacilityDto, UpdateFacilityDto } from '../dtos/facility.dto';
export declare class FacilityController {
    private readonly facilityService;
    constructor(facilityService: FacilityService);
    createFacility(createFacilityDto: CreateFacilityDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas/facility.schema").IFacility>>;
    getFacilities(venueId?: string, facilityType?: string, status?: string, page?: number, limit?: number): Promise<import("@shared/api-response").PaginatedResponse<unknown>>;
    getFacilityById(id: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas/facility.schema").IFacility>>;
    updateFacility(id: string, updateFacilityDto: UpdateFacilityDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas/facility.schema").IFacility>>;
    updateFacilityStatus(id: string, status: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas/facility.schema").IFacility>>;
    assignEquipment(id: string, equipmentId: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas/facility.schema").IFacility>>;
    removeEquipment(id: string, equipmentId: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas/facility.schema").IFacility>>;
    updateUtilization(id: string, hoursUsed: number): Promise<import("@shared/api-response").ApiResponse<import("../schemas/facility.schema").IFacility>>;
    updateMaintenanceSchedule(id: string, lastMaintenance: Date, nextMaintenance: Date): Promise<import("@shared/api-response").ApiResponse<import("../schemas/facility.schema").IFacility>>;
    getFacilityStats(venueId: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    decommissionFacility(id: string, reason: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas/facility.schema").IFacility>>;
}
//# sourceMappingURL=facility.controller.d.ts.map