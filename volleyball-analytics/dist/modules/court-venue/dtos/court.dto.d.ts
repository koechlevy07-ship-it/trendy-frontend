import { CourtType, SurfaceType, CourtOrientation, CourtStatus, MaintenanceStatus } from '../schemas/court.schema';
export declare class CreateCourtDimensionsDto {
    length: number;
    width: number;
    freeZoneLength: number;
    freeZoneWidth: number;
    netHeight: number;
    attackLineDistance: number;
    serviceZoneWidth: number;
    ceilingHeight?: number;
}
export declare class CreateCourtEquipmentDto {
    netSystem: string;
    posts: string;
    antennas: string;
    scoreboard: string;
    refereeStand: string;
    lighting: string;
    flooring: string;
}
export declare class CreateCourtAIConfigurationDto {
    cameraProfileId?: string;
    calibrationProfileId?: string;
    trackingEnabled?: boolean;
    actionRecognitionEnabled?: boolean;
    poseEstimationEnabled?: boolean;
    ballTrackingEnabled?: boolean;
    jerseyDetectionEnabled?: boolean;
    customModelConfig?: Record<string, unknown>;
}
export declare class CreateCourtDto {
    venueId: string;
    courtCode: string;
    courtName: string;
    courtType: CourtType;
    surfaceType: SurfaceType;
    dimensions: CreateCourtDimensionsDto;
    orientation: CourtOrientation;
    status?: CourtStatus;
    equipment: CreateCourtEquipmentDto;
    aiConfiguration: CreateCourtAIConfigurationDto;
    assignedCameraIds?: string[];
    metadata?: Record<string, unknown>;
    createdBy: string;
}
export declare class UpdateCourtDto {
    availability?: boolean;
    maintenanceStatus?: MaintenanceStatus;
    equipment?: string[];
    cameraProfile?: string;
    calibrationProfile?: string;
    metadata?: Record<string, unknown>;
}
export declare class CourtSearchDto {
    search?: string;
    venueId?: string;
    courtType?: CourtType;
    surfaceType?: SurfaceType;
    status?: CourtStatus;
    maintenanceStatus?: MaintenanceStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class ActivateCourtDto {
    activatedBy: string;
}
export declare class SetMaintenanceDto {
    isUnderMaintenance: boolean;
    maintenanceStartDate?: Date;
    maintenanceEndDate?: Date;
    maintenanceReason?: string;
    scheduledMaintenance?: Date[];
}
export declare class AssignCameraDto {
    cameraId: string;
}
export declare class CourtResponseDto {
    id: string;
    courtCode: string;
    courtName: string;
    venueId: string;
    courtType: CourtType;
    surfaceType: SurfaceType;
    dimensions: CreateCourtDimensionsDto;
    orientation: CourtOrientation;
    status: CourtStatus;
    maintenanceStatus: MaintenanceStatus;
    equipment: CreateCourtEquipmentDto;
    aiConfiguration: CreateCourtAIConfigurationDto;
    assignedCameraIds: string[];
    activeCalibrationId?: string;
    metadata: Record<string, unknown>;
    activatedAt?: Date;
    activatedBy?: string;
    suspendedAt?: Date;
    suspendedBy?: string;
    archivedAt?: Date;
    archivedBy?: string;
    maintenanceScheduledAt?: Date;
    maintenanceCompletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CourtPaginatedResponseDto {
    data: CourtResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
//# sourceMappingURL=court.dto.d.ts.map