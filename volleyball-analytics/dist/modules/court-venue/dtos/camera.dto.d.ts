import { CameraMountType, CameraStatus, CameraManufacturer } from '../schemas/camera.schema';
export declare class CreateCameraPositionDto {
    x: number;
    y: number;
    z: number;
    roll: number;
    pitch: number;
    yaw: number;
}
export declare class CreateCameraFOVDto {
    horizontal: number;
    vertical: number;
}
export declare class CreateCameraResolutionDto {
    width: number;
    height: number;
}
export declare class CreateCameraStreamConfigDto {
    protocol: 'rtsp' | 'rtmp' | 'http' | 'https' | 'websocket' | 'srt' | 'ndi';
    url: string;
    username?: string;
    password?: string;
    streamPath?: string;
    backupUrl?: string;
    transport?: 'tcp' | 'udp' | 'multicast';
}
export declare class CreateCameraSpecsDto {
    sensorType: string;
    sensorSize: string;
    focalLength: number;
    aperture: string;
    isoRange: string;
    shutterSpeedRange: string;
    whiteBalance: string[];
    focusMode: string[];
}
export declare class CreateCameraDto {
    courtId: string;
    cameraId: string;
    name: string;
    manufacturer: CameraManufacturer;
    model: string;
    serialNumber: string;
    firmwareVersion?: string;
    mountType: CameraMountType;
    position: CreateCameraPositionDto;
    fieldOfView: CreateCameraFOVDto;
    resolution: CreateCameraResolutionDto;
    frameRate: number;
    bitrate?: number;
    codec?: string;
    streamConfig: CreateCameraStreamConfigDto;
    specs: CreateCameraSpecsDto;
    status?: CameraStatus;
    assignedCoverageZones?: string[];
    calibrationProfileId?: string;
    metadata?: Record<string, unknown>;
    createdBy: string;
}
export declare class UpdateCameraDto {
    name?: string;
    position?: CreateCameraPositionDto;
    fieldOfView?: CreateCameraFOVDto;
    frameRate?: number;
    streamConfig?: CreateCameraStreamConfigDto;
    status?: CameraStatus;
    calibrationProfileId?: string;
    assignedCoverageZones?: string[];
    metadata?: Record<string, unknown>;
}
export declare class CameraSearchDto {
    search?: string;
    courtId?: string;
    manufacturer?: CameraManufacturer;
    mountType?: CameraMountType;
    status?: CameraStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class ActivateCameraDto {
    cameraId: string;
}
export declare class CalibrateCameraDto {
    cameraId: string;
    calibrationProfileId: string;
}
export declare class CameraResponseDto {
    id: string;
    cameraId: string;
    courtId: string;
    name: string;
    manufacturer: CameraManufacturer;
    model: string;
    serialNumber: string;
    firmwareVersion?: string;
    mountType: CameraMountType;
    position: CreateCameraPositionDto;
    fieldOfView: CreateCameraFOVDto;
    resolution: CreateCameraResolutionDto;
    frameRate: number;
    bitrate?: number;
    codec?: string;
    streamConfig: CreateCameraStreamConfigDto;
    specs: CreateCameraSpecsDto;
    status: CameraStatus;
    assignedCoverageZones: string[];
    calibrationProfileId?: string;
    metadata: Record<string, unknown>;
    lastHeartbeat?: Date;
    errorMessage?: string;
    connectedAt?: Date;
    activatedAt?: Date;
    calibratedAt?: Date;
    decommissionedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CameraPaginatedResponseDto {
    data: CameraResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
//# sourceMappingURL=camera.dto.d.ts.map