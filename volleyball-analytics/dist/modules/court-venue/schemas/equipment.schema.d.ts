import { Schema, Types, HydratedDocument, Document } from 'mongoose';
export declare enum EquipmentCategory {
    NET_SYSTEM = "net_system",
    POSTS = "posts",
    ANTENNAS = "antennas",
    SCOREBOARD = "scoreboard",
    REFEREE_STAND = "referee_stand",
    LIGHTING = "lighting",
    FLOORING = "flooring",
    BALLS = "balls",
    BALL_CART = "ball_cart",
    NET_HEIGHT_GAUGE = "net_height_gauge",
    MEASURING_TAPE = "measuring_tape",
    COURT_LINE_MARKER = "court_line_marker",
    SAND_RAKE = "sand_rake",
    WATER_REMOVAL = "water_removal",
    FIRST_AID = "first_aid",
    AED = "aed",
    ICE_MACHINE = "ice_machine",
    TRAINING_AIDS = "training_aids",
    VIDEO_REPLAY = "video_replay",
    COMMUNICATION = "communication",
    TIMING_SYSTEM = "timing_system",
    STATISTICS_SYSTEM = "statistics_system",
    CAMERA_SYSTEM = "camera_system",
    CALIBRATION_TOOLS = "calibration_tools",
    MAINTENANCE_TOOLS = "maintenance_tools",
    CLEANING_EQUIPMENT = "cleaning_equipment",
    SAFETY_EQUIPMENT = "safety_equipment",
    OTHER = "other"
}
export declare enum EquipmentStatus {
    AVAILABLE = "available",
    IN_USE = "in_use",
    MAINTENANCE = "maintenance",
    REPAIR = "repair",
    CALIBRATION = "calibration",
    INSPECTION = "inspection",
    RETIRED = "retired",
    LOST = "lost",
    DAMAGED = "damaged",
    RESERVED = "reserved"
}
export declare enum EquipmentCondition {
    NEW = "new",
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor",
    UNUSABLE = "unusable"
}
export interface IEquipmentSpecifications {
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    weight?: {
        value: number;
        unit: string;
    };
    material?: string[];
    color?: string;
    powerRequirements?: {
        voltage: number;
        amperage: number;
        phase: string;
        connectorType: string;
    };
    operatingTemperature?: {
        min: number;
        max: number;
        unit: string;
    };
    certifications?: string[];
    customSpecs?: Record<string, unknown>;
}
export interface IEquipmentMaintenance {
    scheduledDate: Date;
    completedDate?: Date;
    type: 'preventive' | 'corrective' | 'calibration' | 'inspection' | 'cleaning';
    description: string;
    performedBy?: Types.ObjectId;
    cost?: number;
    partsReplaced?: string[];
    notes?: string;
    nextMaintenanceDate?: Date;
    status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
}
export interface IEquipmentCertification {
    name: string;
    issuingBody: string;
    certificateNumber: string;
    issuedDate: Date;
    expiryDate: Date;
    status: 'valid' | 'expired' | 'expiring_soon' | 'revoked';
    documentUrl?: string;
    verifiedBy?: Types.ObjectId;
    verifiedAt?: Date;
}
export interface IEquipment extends Document {
    venueId: Types.ObjectId;
    courtId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentCode: string;
    name: string;
    category: EquipmentCategory;
    manufacturer: string;
    model: string;
    serialNumber: string;
    assetTag?: string;
    specifications: IEquipmentSpecifications;
    status: EquipmentStatus;
    condition: EquipmentCondition;
    purchaseDate?: Date;
    purchaseCost?: number;
    warrantyExpiry?: Date;
    expectedLifespanMonths?: number;
    assignedTo?: Types.ObjectId;
    location?: string;
    maintenanceHistory: IEquipmentMaintenance[];
    certifications: IEquipmentCertification[];
    calibrationRecords: {
        calibrationProfileId: Types.ObjectId;
        calibratedAt: Date;
        calibratedBy: Types.ObjectId;
        nextCalibrationDue: Date;
        status: 'passed' | 'failed' | 'conditional';
        notes?: string;
    }[];
    metadata: Record<string, unknown>;
    retiredAt?: Date;
    retiredReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export type EquipmentDocument = HydratedDocument<IEquipment>;
export declare const EquipmentSchema: Schema<IEquipment, import("mongoose").Model<IEquipment, any, any, any, Document<unknown, any, IEquipment, any, {}> & IEquipment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, IEquipment, Document<unknown, {}, import("mongoose").FlatRecord<IEquipment>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<IEquipment> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const Equipment: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<IEquipment, {}, {}, {}, Document<unknown, {}, IEquipment, {}, {}> & IEquipment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=equipment.schema.d.ts.map