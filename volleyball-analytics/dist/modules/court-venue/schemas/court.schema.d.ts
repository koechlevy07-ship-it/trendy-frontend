import { Types, HydratedDocument, Document } from 'mongoose';
export declare enum CourtType {
    INDOOR_VOLLEYBALL = "indoor_volleyball",
    BEACH_VOLLEYBALL = "beach_volleyball",
    SITTING_VOLLEYBALL = "sitting_volleyball",
    SNOW_VOLLEYBALL = "snow_volleyball",
    GRASS_VOLLEYBALL = "grass_volleyball",
    TRAINING = "training",
    WARM_UP = "warm_up"
}
export declare enum SurfaceType {
    WOOD = "wood",
    SYNTHETIC = "synthetic",
    TARA = "tara",
    CONCRETE = "concrete",
    SAND = "sand",
    GRASS = "grass",
    SNOW = "snow",
    MODULAR = "modular",
    RUBBER = "rubber"
}
export declare enum CourtStatus {
    DRAFT = "draft",
    REGISTERED = "registered",
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    SUSPENDED = "suspended",
    ARCHIVED = "archived"
}
export declare enum CourtOrientation {
    NORTH_SOUTH = "north_south",
    EAST_WEST = "east_west",
    NORTHEAST_SOUTHWEST = "northeast_southwest",
    NORTHWEST_SOUTHEAST = "northwest_southeast"
}
export declare enum MaintenanceStatus {
    NONE = "none",
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    OVERDUE = "overdue"
}
export interface ICourtDimensions {
    length: number;
    width: number;
    freeZoneLength: number;
    freeZoneWidth: number;
    netHeight: number;
    netHeightMen?: number;
    netHeightWomen?: number;
    poleDistance?: number;
    antennaHeight?: number;
    serviceZoneDepth?: number;
    substitutionZoneLength?: number;
    liberoZoneLength?: number;
}
export interface ICourtEquipment {
    netSystem: {
        type: string;
        manufacturer: string;
        model: string;
        serialNumber?: string;
        lastInspection?: Date;
    };
    posts: {
        type: string;
        manufacturer: string;
        model: string;
        serialNumber?: string;
        lastInspection?: Date;
    }[];
    antennae: {
        manufacturer: string;
        model: string;
        serialNumber?: string;
    }[];
    scoreboard?: {
        type: string;
        manufacturer: string;
        model: string;
        serialNumber?: string;
    };
    lighting?: {
        type: string;
        luxLevel: number;
        manufacturer: string;
    };
    padding?: {
        type: string;
        manufacturer: string;
    };
}
export interface ICourtAIConfiguration {
    enabled: boolean;
    trackingConfig?: Record<string, unknown>;
    detectionConfig?: Record<string, unknown>;
    actionRecognitionConfig?: Record<string, unknown>;
}
export interface ICourt extends Document {
    venueId: Types.ObjectId;
    courtCode: string;
    courtName: string;
    courtType: CourtType;
    surfaceType: SurfaceType;
    dimensions: ICourtDimensions;
    orientation: CourtOrientation;
    status: CourtStatus;
    equipment: ICourtEquipment;
    cameraProfileId?: Types.ObjectId;
    calibrationProfileId?: Types.ObjectId;
    maintenanceStatus: {
        isUnderMaintenance: boolean;
        maintenanceStartDate?: Date;
        maintenanceEndDate?: Date;
        maintenanceReason?: string;
        scheduledMaintenance?: Date[];
    };
    availability: {
        isBookable: boolean;
        blockoutDates: Date[];
        recurringBlockouts: {
            dayOfWeek: number;
            startTime: string;
            endTime: string;
        }[];
    };
    aiConfiguration: ICourtAIConfiguration;
    metadata: Record<string, unknown>;
    activatedAt?: Date;
    activatedBy?: Types.ObjectId;
    suspendedAt?: Date;
    suspendedBy?: Types.ObjectId;
    archivedAt?: Date;
    archivedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export type CourtDocument = HydratedDocument<ICourt>;
export declare const Court: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<ICourt, {}, {}, {}, Document<unknown, {}, ICourt, {}, {}> & ICourt & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=court.schema.d.ts.map