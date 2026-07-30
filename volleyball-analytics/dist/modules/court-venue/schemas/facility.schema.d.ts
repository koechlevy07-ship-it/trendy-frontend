import { Types, HydratedDocument, Document } from 'mongoose';
export declare enum FacilityType {
    LOBBY = "lobby",
    LOCKER_ROOM = "locker_room",
    RESTROOM = "restroom",
    MEDICAL_ROOM = "medical_room",
    REFEREE_ROOM = "referee_room",
    COACH_ROOM = "coach_room",
    PLAYER_LOUNGE = "player_lounge",
    VIP_LOUNGE = "vip_lounge",
    MEDIA_ROOM = "media_room",
    CONTROL_ROOM = "control_room",
    SERVER_ROOM = "server_room",
    STORAGE = "storage",
    EQUIPMENT_ROOM = "equipment_room",
    WEIGHT_ROOM = "weight_room",
    REHABILITATION = "rehabilitation",
    CAFETERIA = "cafeteria",
    CONCESSION = "concession",
    MERCHANDISE = "merchandise",
    FIRST_AID = "first_aid",
    SECURITY_OFFICE = "security_office",
    ADMINISTRATION = "administration",
    MEETING_ROOM = "meeting_room",
    BROADCAST_BOOTH = "broadcast_booth",
    COMMENTARY_POSITION = "commentary_position",
    CAMERA_POSITION = "camera_position",
    LIGHTING_GANTRY = "lighting_gantry",
    SCOREBOARD = "scoreboard",
    VIDEO_BOARD = "video_board",
    SOUND_SYSTEM = "sound_system",
    HVAC = "hvac",
    FIRE_SUPPRESSION = "fire_suppression",
    EMERGENCY_EXIT = "emergency_exit",
    ACCESSIBLE_RAMP = "accessible_ramp",
    ELEVATOR = "elevator",
    ESCALATOR = "escalator",
    PARKING = "parking",
    OUTDOOR_COURT_AREA = "outdoor_court_area",
    SPECTATOR_SEATING = "spectator_seating",
    PLAYER_BENCH = "player_bench",
    OFFICIALS_TABLE = "officials_table",
    WARM_UP_AREA = "warm_up_area",
    COOL_DOWN_AREA = "cool_down_area",
    OTHER = "other"
}
export declare enum FacilityStatus {
    AVAILABLE = "available",
    OCCUPIED = "occupied",
    MAINTENANCE = "maintenance",
    CLEANING = "cleaning",
    RESERVED = "reserved",
    OUT_OF_SERVICE = "out_of_service",
    DECOMMISSIONED = "decommissioned"
}
export interface IFacilityCapacity {
    seated: number;
    standing: number;
    wheelchairAccessible: number;
    maxOccupancy: number;
}
export interface IFacilityFeatures {
    hasHVAC: boolean;
    hasWiFi: boolean;
    hasPowerOutlets: boolean;
    hasWaterSupply: boolean;
    hasDrainage: boolean;
    hasNaturalLight: boolean;
    hasEmergencyLighting: boolean;
    hasFireExtinguisher: boolean;
    hasFirstAidKit: boolean;
    hasSecurityCamera: boolean;
    hasAccessControl: boolean;
    isWheelchairAccessible: boolean;
    hasAudioSystem: boolean;
    hasVideoDisplay: boolean;
    hasClimateControl: boolean;
    customFeatures: Record<string, unknown>;
}
export interface IFacilityDimensions {
    length: number;
    width: number;
    height: number;
    area: number;
    volume: number;
}
export interface IFacility extends Document {
    venueId: Types.ObjectId;
    facilityCode: string;
    name: string;
    facilityType: FacilityType;
    status: FacilityStatus;
    location: {
        floor?: string;
        section?: string;
        roomNumber?: string;
        coordinates?: {
            x: number;
            y: number;
            z: number;
        };
        nearestCourt?: Types.ObjectId;
    };
    capacity: IFacilityCapacity;
    dimensions: IFacilityDimensions;
    features: IFacilityFeatures;
    assignedEquipment: Types.ObjectId[];
    maintenanceSchedule: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'as_needed';
        lastMaintenance?: Date;
        nextMaintenance?: Date;
        maintenanceTasks: string[];
    };
    cleaningSchedule: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'after_each_use' | 'as_needed';
        lastCleaning?: Date;
        nextCleaning?: Date;
        cleaningProtocol: string;
    };
    utilizationMetrics: {
        totalBookings: number;
        totalHoursUsed: number;
        averageOccupancyRate: number;
        peakUsageHours: number[];
        lastUpdated: Date;
    };
    accessControl: {
        requiredAccessLevel: string[];
        requiresKeyCard: boolean;
        requiresBiometric: boolean;
        accessHours: {
            start: string;
            end: string;
        }[];
    };
    metadata: Record<string, unknown>;
    decommissionedAt?: Date;
    decommissionedReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export type FacilityDocument = HydratedDocument<IFacility>;
export declare const Facility: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<IFacility, {}, {}, {}, Document<unknown, {}, IFacility, {}, {}> & IFacility & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=facility.schema.d.ts.map