import { CourtService } from '../services/court.service';
import { CreateCourtDto, UpdateCourtDto, ActivateCourtDto, SetMaintenanceDto, AssignCameraDto, CourtSearchDto } from '../dtos/court.dto';
export declare class CourtController {
    private readonly courtService;
    constructor(courtService: CourtService);
    createCourt(createCourtDto: CreateCourtDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICourt>>;
    getCourts(searchDto: CourtSearchDto): Promise<import("@shared/api-response").PaginatedResponse<unknown>>;
    getCourtById(id: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICourt>>;
    getCourtsByVenue(venueId: string, page?: number, limit?: number): Promise<import("@shared/api-response").PaginatedResponse<unknown>>;
    updateCourt(id: string, updateCourtDto: UpdateCourtDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICourt>>;
    activateCourt(id: string, activateDto: ActivateCourtDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICourt>>;
    setMaintenance(id: string, maintenanceDto: SetMaintenanceDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICourt>>;
    assignCamera(id: string, assignDto: AssignCameraDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICourt>>;
    removeCamera(id: string, cameraId: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICourt>>;
    archiveCourt(id: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    restoreCourt(id: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICourt>>;
    getCourtStats(venueId: string): Promise<import("@shared/api-response").ApiResponse<any>>;
}
//# sourceMappingURL=court.controller.d.ts.map