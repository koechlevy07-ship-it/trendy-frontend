import { Model } from 'mongoose';
import { ICamera, CameraMountType, CameraStatus, CameraManufacturer } from '../schemas/camera.schema';
import { ICourt } from '../schemas/court.schema';
import { ICoverageZone } from '../schemas/coverage-zone.schema';
import { ICalibrationProfile } from '../schemas/calibration.schema';
export declare class CameraService {
    private cameraModel;
    private courtModel;
    private coverageZoneModel;
    private calibrationModel;
    constructor(cameraModel: Model<ICamera>, courtModel: Model<ICourt>, coverageZoneModel: Model<ICoverageZone>, calibrationModel: Model<ICalibrationProfile>);
    createCamera(dto: CreateCameraDto, userId: string): Promise<ICamera>;
    getCameras(searchDto: CameraSearchDto): Promise<any>;
    getCameraById(id: string): Promise<ICamera>;
    getCameraByCameraId(cameraId: string): Promise<ICamera>;
    getCamerasByCourt(courtId: string): Promise<ICamera[]>;
    updateCamera(id: string, updateCameraDto: UpdateCameraDto, userId: string): Promise<ICamera>;
    activateCamera(id: string): Promise<ICamera>;
    deactivateCamera(id: string, userId: string): Promise<ICamera>;
    assignCalibrationProfile(id: string, calibrationProfileId: string, userId: string): Promise<ICamera>;
    assignCoverageZone(cameraId: string, zoneId: string): Promise<ICamera>;
    removeCoverageZone(cameraId: string, zoneId: string): Promise<ICamera>;
    updatePosition(id: string, position: ICamera['position'], userId: string): Promise<ICamera>;
    updateStreamConfig(id: string, streamConfig: ICamera['streamConfig']): Promise<ICamera>;
    recordHeartbeat(id: string): Promise<ICamera>;
    recordError(id: string, error: string): Promise<ICamera>;
    getCameraStats(courtId: string): Promise<any>;
    decommissionCamera(id: string, userId: string): Promise<ICamera>;
    private validateCameraPositioning;
    private publishEvent;
}
export interface CreateCameraDto {
    courtId: string;
    cameraId: string;
    name: string;
    manufacturer: CameraManufacturer;
    model: string;
    serialNumber: string;
    firmwareVersion?: string;
    mountType: CameraMountType;
    position: {
        x: number;
        y: number;
        z: number;
        roll: number;
        pitch: number;
        yaw: number;
    };
    fieldOfView: {
        horizontal: number;
        vertical: number;
    };
    resolution: {
        width: number;
        height: number;
    };
    frameRate: number;
    bitrate?: number;
    codec?: string;
    streamConfig: {
        protocol: 'rtsp' | 'rtmp' | 'http' | 'https' | 'websocket' | 'srt' | 'ndi';
        url: string;
        username?: string;
        password?: string;
        streamPath?: string;
        backupUrl?: string;
        transport?: 'tcp' | 'udp' | 'multicast';
    };
    specs: {
        sensorType: string;
        sensorSize: string;
        focalLength: number;
        aperture: string;
        isoRange: string;
        shutterSpeedRange: string;
        whiteBalance: string[];
        focusMode: string[];
    };
    assignedCoverageZones?: string[];
    calibrationProfileId?: string;
    metadata?: Record<string, unknown>;
    createdBy: string;
}
export interface UpdateCameraDto {
    name?: string;
    position?: {
        x: number;
        y: number;
        z: number;
        roll: number;
        pitch: number;
        yaw: number;
    };
    fieldOfView?: {
        horizontal: number;
        vertical: number;
    };
    frameRate?: number;
    streamConfig?: {
        protocol: 'rtsp' | 'rtmp' | 'http' | 'https' | 'websocket' | 'srt' | 'ndi';
        url: string;
        username?: string;
        password?: string;
        streamPath?: string;
        backupUrl?: string;
        transport?: 'tcp' | 'udp' | 'multicast';
    };
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
//# sourceMappingURL=camera.service.d.ts.map