import { CameraService } from '../services/camera.service';
import { CreateCameraDto, UpdateCameraDto, CalibrateCameraDto, CameraSearchDto } from '../dtos/camera.dto';
export declare class CameraController {
    private readonly cameraService;
    constructor(cameraService: CameraService);
    createCamera(createCameraDto: CreateCameraDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICamera>>;
    getCameras(searchDto: CameraSearchDto): Promise<import("@shared/api-response").PaginatedResponse<unknown>>;
    getCameraById(id: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICamera>>;
    getCamerasByCourt(courtId: string, page?: number, limit?: number): Promise<import("@shared/api-response").PaginatedResponse<unknown>>;
    updateCamera(id: string, updateCameraDto: UpdateCameraDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICamera>>;
    activateCamera(id: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICamera>>;
    deactivateCamera(id: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICamera>>;
    calibrateCamera(id: string, calibrateDto: CalibrateCameraDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICamera>>;
    assignCoverageZone(id: string, zoneId: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICamera>>;
    removeCoverageZone(id: string, zoneId: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICamera>>;
    updateHeartbeat(id: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    getCameraStats(courtId: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    decommissionCamera(id: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICamera>>;
}
//# sourceMappingURL=camera.controller.d.ts.map