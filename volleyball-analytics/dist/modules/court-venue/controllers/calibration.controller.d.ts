import { CalibrationService } from '../services/calibration.service';
import { CreateCalibrationProfileDto, UpdateCalibrationProfileDto, ActivateCalibrationDto, ValidateCalibrationDto, CalibrationProfileSearchDto } from '../dtos/calibration.dto';
export declare class CalibrationController {
    private readonly calibrationService;
    constructor(calibrationService: CalibrationService);
    createCalibration(createCalibrationDto: CreateCalibrationProfileDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICalibrationProfile>>;
    getCalibrations(searchDto: CalibrationProfileSearchDto): Promise<import("@shared/api-response").PaginatedResponse<unknown>>;
    getCalibrationById(id: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICalibrationProfile>>;
    getActiveCalibration(cameraInstallationId: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICalibrationProfile>>;
    updateCalibration(id: string, updateDto: UpdateCalibrationProfileDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICalibrationProfile>>;
    activateCalibration(id: string, activateDto: ActivateCalibrationDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICalibrationProfile>>;
    validateCalibration(id: string, validateDto: ValidateCalibrationDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICalibrationProfile>>;
    archiveCalibration(id: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").ICalibrationProfile>>;
    getCalibrationStats(): Promise<import("@shared/api-response").ApiResponse<any>>;
}
//# sourceMappingURL=calibration.controller.d.ts.map