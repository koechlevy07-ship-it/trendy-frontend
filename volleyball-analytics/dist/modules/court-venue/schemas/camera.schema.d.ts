import { Types, HydratedDocument, Document } from 'mongoose';
export declare enum CameraMountType {
    CEILING = "ceiling",
    WALL = "wall",
    POLE = "pole",
    TRIPOD = "tripod",
    GANTRY = "gantry",
    HANDHELD = "handheld",
    DRONE = "drone"
}
export declare enum CameraStatus {
    REGISTERED = "registered",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    ACTIVE = "active",
    INACTIVE = "inactive",
    CALIBRATING = "calibrating",
    CALIBRATED = "calibrated",
    ERROR = "error",
    MAINTENANCE = "maintenance",
    DECOMMISSIONED = "decommissioned"
}
export declare enum CameraManufacturer {
    SONY = "sony",
    PANASONIC = "panasonic",
    CANON = "canon",
    HIKVISION = "hikvision",
    DAHUA = "dahua",
    AXIS = "axis",
    BOSCH = "bosch",
    FLIR = "flir",
    BASLER = "basler",
    IDS = "ids",
    POINT_GREY = "point_grey",
    LOGITECH = "logitech",
    GOPRO = "gopro",
    DJI = "dji",
    CUSTOM = "custom"
}
export interface ICameraPosition {
    x: number;
    y: number;
    z: number;
    roll: number;
    pitch: number;
    yaw: number;
}
export interface ICameraFOV {
    horizontal: number;
    vertical: number;
}
export interface ICameraResolution {
    width: number;
    height: number;
}
export interface ICameraStreamConfig {
    protocol: 'rtsp' | 'rtmp' | 'http' | 'https' | 'websocket' | 'srt' | 'ndi';
    url: string;
    username?: string;
    password?: string;
    streamPath?: string;
    backupUrl?: string;
    transport?: 'tcp' | 'udp' | 'multicast';
}
export interface ICameraSpecs {
    sensorType: string;
    sensorSize: string;
    focalLength: number;
    aperture: string;
    isoRange: string;
    shutterSpeedRange: string;
    whiteBalance: string[];
    focusMode: string[];
}
export interface ICamera {
    courtId: Types.ObjectId;
    cameraId: string;
    name: string;
    manufacturer: CameraManufacturer;
    model: string;
    serialNumber: string;
    firmwareVersion?: string;
    mountType: CameraMountType;
    position: ICameraPosition;
    fieldOfView: ICameraFOV;
    resolution: ICameraResolution;
    frameRate: number;
    bitrate?: number;
    codec?: string;
    streamConfig: ICameraStreamConfig;
    specs: ICameraSpecs;
    status: CameraStatus;
    assignedCoverageZones: Types.ObjectId[];
    calibrationProfileId?: Types.ObjectId;
    healthMetrics: {
        lastHeartbeat?: Date;
        uptimePercentage: number;
        frameDropRate: number;
        latencyMs: number;
        errorCount: number;
        lastError?: string;
    };
    metadata: Record<string, unknown>;
    connectedAt?: Date;
    activatedAt?: Date;
    calibratedAt?: Date;
    decommissionedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export type CameraDocument = HydratedDocument<ICamera>;
export declare const Camera: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<ICamera, {}, {}, {}, Document<unknown, {}, ICamera, {}, {}> & ICamera & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=camera.schema.d.ts.map