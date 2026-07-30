import { Schema, Types, Document } from 'mongoose';
export declare enum MaintenanceType {
    PREVENTIVE = "preventive",
    CORRECTIVE = "corrective",
    PREDICTIVE = "predictive",
    CALIBRATION = "calibration",
    INSPECTION = "inspection",
    CLEANING = "cleaning",
    UPGRADE = "upgrade",
    REPLACEMENT = "replacement",
    EMERGENCY = "emergency",
    WARRANTY = "warranty"
}
export declare enum MaintenanceStatus {
    SCHEDULED = "scheduled",
    ASSIGNED = "assigned",
    IN_PROGRESS = "in_progress",
    ON_HOLD = "on_hold",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    OVERDUE = "overdue",
    REQUIRES_FOLLOWUP = "requires_followup"
}
export declare enum MaintenancePriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical",
    EMERGENCY = "emergency"
}
export interface IMaintenanceChecklistItem {
    itemId: string;
    description: string;
    isRequired: boolean;
    status: 'pending' | 'completed' | 'skipped' | 'failed';
    completedAt?: Date;
    completedBy?: Types.ObjectId;
    notes?: string;
    evidence?: {
        type: string;
        url: string;
    }[];
}
export interface IMaintenancePart {
    partId: string;
    name: string;
    partNumber: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    supplier?: string;
    warrantyExpiry?: Date;
    notes?: string;
}
export interface IMaintenanceLabor {
    technicianId: Types.ObjectId;
    technicianName: string;
    role: string;
    hoursWorked: number;
    hourlyRate: number;
    totalCost: number;
    tasksPerformed: string[];
}
export interface IMaintenanceRecord extends Document {
    maintenanceCode: string;
    title: string;
    description: string;
    maintenanceType: MaintenanceType;
    status: MaintenanceStatus;
    priority: MaintenancePriority;
    venueId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    sensorId?: Types.ObjectId;
    cameraId?: Types.ObjectId;
    calibrationProfileId?: Types.ObjectId;
    scheduledDate: Date;
    estimatedDurationMinutes: number;
    actualStartDate?: Date;
    actualEndDate?: Date;
    actualDurationMinutes?: number;
    assignedTechnicianId?: Types.ObjectId;
    assignedTechnicianName?: string;
    supervisingEngineerId?: Types.ObjectId;
    checklist: IMaintenanceChecklistItem[];
    partsUsed: IMaintenancePart[];
    labor: IMaintenanceLabor[];
    totalCost: number;
    costBreakdown: {
        partsCost: number;
        laborCost: number;
        externalServiceCost: number;
        otherCost: number;
    };
    findings: string;
    recommendations: string[];
    followUpRequired: boolean;
    followUpDate?: Date;
    followUpDescription?: string;
    documents: Types.ObjectId[];
    photos: string[];
    signatures: {
        technicianId: Types.ObjectId;
        technicianName: string;
        signedAt: Date;
        signatureData?: string;
    }[];
    approvals: {
        approvedBy: Types.ObjectId;
        approvedAt: Date;
        version: number;
        comments?: string;
    }[];
    metadata: Record<string, unknown>;
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MaintenanceRecordSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    collection: string;
}, {
    status: MaintenanceStatus;
    documents: Types.ObjectId[];
    metadata: any;
    description: string;
    createdBy: Types.ObjectId;
    scheduledDate: NativeDate;
    recommendations: string[];
    priority: MaintenancePriority;
    title: string;
    totalCost: number;
    maintenanceCode: string;
    maintenanceType: MaintenanceType;
    estimatedDurationMinutes: number;
    checklist: Types.DocumentArray<{
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }> & {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }>;
    partsUsed: Types.DocumentArray<{
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }> & {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }>;
    labor: Types.DocumentArray<{
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }, Types.Subdocument<import("bson").ObjectId, any, {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }> & {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }>;
    costBreakdown: {
        partsCost: number;
        laborCost: number;
        externalServiceCost: number;
        otherCost: number;
    };
    followUpRequired: boolean;
    photos: string[];
    venueId?: Types.ObjectId;
    calibrationProfileId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    cameraId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    sensorId?: Types.ObjectId;
    findings?: string;
    updatedBy?: Types.ObjectId;
    actualStartDate?: NativeDate;
    actualEndDate?: NativeDate;
    actualDurationMinutes?: number;
    assignedTechnicianId?: Types.ObjectId;
    assignedTechnicianName?: string;
    supervisingEngineerId?: Types.ObjectId;
    followUpDate?: NativeDate;
    followUpDescription?: string;
    signatures?: {
        technicianId: Types.ObjectId;
        technicianName: string;
        signedAt: NativeDate;
        signatureData?: string;
    };
    approvals?: {
        version: number;
        approvedBy: Types.ObjectId;
        approvedAt: NativeDate;
        comments?: string;
    };
} & import("mongoose").DefaultTimestampProps, Document<unknown, {}, import("mongoose").FlatRecord<{
    status: MaintenanceStatus;
    documents: Types.ObjectId[];
    metadata: any;
    description: string;
    createdBy: Types.ObjectId;
    scheduledDate: NativeDate;
    recommendations: string[];
    priority: MaintenancePriority;
    title: string;
    totalCost: number;
    maintenanceCode: string;
    maintenanceType: MaintenanceType;
    estimatedDurationMinutes: number;
    checklist: Types.DocumentArray<{
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }> & {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }>;
    partsUsed: Types.DocumentArray<{
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }> & {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }>;
    labor: Types.DocumentArray<{
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }, Types.Subdocument<import("bson").ObjectId, any, {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }> & {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }>;
    costBreakdown: {
        partsCost: number;
        laborCost: number;
        externalServiceCost: number;
        otherCost: number;
    };
    followUpRequired: boolean;
    photos: string[];
    venueId?: Types.ObjectId;
    calibrationProfileId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    cameraId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    sensorId?: Types.ObjectId;
    findings?: string;
    updatedBy?: Types.ObjectId;
    actualStartDate?: NativeDate;
    actualEndDate?: NativeDate;
    actualDurationMinutes?: number;
    assignedTechnicianId?: Types.ObjectId;
    assignedTechnicianName?: string;
    supervisingEngineerId?: Types.ObjectId;
    followUpDate?: NativeDate;
    followUpDescription?: string;
    signatures?: {
        technicianId: Types.ObjectId;
        technicianName: string;
        signedAt: NativeDate;
        signatureData?: string;
    };
    approvals?: {
        version: number;
        approvedBy: Types.ObjectId;
        approvedAt: NativeDate;
        comments?: string;
    };
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
    collection: string;
}>> & import("mongoose").FlatRecord<{
    status: MaintenanceStatus;
    documents: Types.ObjectId[];
    metadata: any;
    description: string;
    createdBy: Types.ObjectId;
    scheduledDate: NativeDate;
    recommendations: string[];
    priority: MaintenancePriority;
    title: string;
    totalCost: number;
    maintenanceCode: string;
    maintenanceType: MaintenanceType;
    estimatedDurationMinutes: number;
    checklist: Types.DocumentArray<{
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }> & {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }>;
    partsUsed: Types.DocumentArray<{
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }> & {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }>;
    labor: Types.DocumentArray<{
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }, Types.Subdocument<import("bson").ObjectId, any, {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }> & {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }>;
    costBreakdown: {
        partsCost: number;
        laborCost: number;
        externalServiceCost: number;
        otherCost: number;
    };
    followUpRequired: boolean;
    photos: string[];
    venueId?: Types.ObjectId;
    calibrationProfileId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    cameraId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    sensorId?: Types.ObjectId;
    findings?: string;
    updatedBy?: Types.ObjectId;
    actualStartDate?: NativeDate;
    actualEndDate?: NativeDate;
    actualDurationMinutes?: number;
    assignedTechnicianId?: Types.ObjectId;
    assignedTechnicianName?: string;
    supervisingEngineerId?: Types.ObjectId;
    followUpDate?: NativeDate;
    followUpDescription?: string;
    signatures?: {
        technicianId: Types.ObjectId;
        technicianName: string;
        signedAt: NativeDate;
        signatureData?: string;
    };
    approvals?: {
        version: number;
        approvedBy: Types.ObjectId;
        approvedAt: NativeDate;
        comments?: string;
    };
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const MaintenanceRecord: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<{
    status: MaintenanceStatus;
    documents: Types.ObjectId[];
    metadata: any;
    description: string;
    createdBy: Types.ObjectId;
    scheduledDate: NativeDate;
    recommendations: string[];
    priority: MaintenancePriority;
    title: string;
    totalCost: number;
    maintenanceCode: string;
    maintenanceType: MaintenanceType;
    estimatedDurationMinutes: number;
    checklist: Types.DocumentArray<{
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }> & {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }>;
    partsUsed: Types.DocumentArray<{
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }> & {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }>;
    labor: Types.DocumentArray<{
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }, Types.Subdocument<import("bson").ObjectId, any, {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }> & {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }>;
    costBreakdown: {
        partsCost: number;
        laborCost: number;
        externalServiceCost: number;
        otherCost: number;
    };
    followUpRequired: boolean;
    photos: string[];
    venueId?: Types.ObjectId;
    calibrationProfileId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    cameraId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    sensorId?: Types.ObjectId;
    findings?: string;
    updatedBy?: Types.ObjectId;
    actualStartDate?: NativeDate;
    actualEndDate?: NativeDate;
    actualDurationMinutes?: number;
    assignedTechnicianId?: Types.ObjectId;
    assignedTechnicianName?: string;
    supervisingEngineerId?: Types.ObjectId;
    followUpDate?: NativeDate;
    followUpDescription?: string;
    signatures?: {
        technicianId: Types.ObjectId;
        technicianName: string;
        signedAt: NativeDate;
        signatureData?: string;
    };
    approvals?: {
        version: number;
        approvedBy: Types.ObjectId;
        approvedAt: NativeDate;
        comments?: string;
    };
} & import("mongoose").DefaultTimestampProps, {}, {}, {}, Document<unknown, {}, {
    status: MaintenanceStatus;
    documents: Types.ObjectId[];
    metadata: any;
    description: string;
    createdBy: Types.ObjectId;
    scheduledDate: NativeDate;
    recommendations: string[];
    priority: MaintenancePriority;
    title: string;
    totalCost: number;
    maintenanceCode: string;
    maintenanceType: MaintenanceType;
    estimatedDurationMinutes: number;
    checklist: Types.DocumentArray<{
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }> & {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }>;
    partsUsed: Types.DocumentArray<{
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }> & {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }>;
    labor: Types.DocumentArray<{
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }, Types.Subdocument<import("bson").ObjectId, any, {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }> & {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }>;
    costBreakdown: {
        partsCost: number;
        laborCost: number;
        externalServiceCost: number;
        otherCost: number;
    };
    followUpRequired: boolean;
    photos: string[];
    venueId?: Types.ObjectId;
    calibrationProfileId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    cameraId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    sensorId?: Types.ObjectId;
    findings?: string;
    updatedBy?: Types.ObjectId;
    actualStartDate?: NativeDate;
    actualEndDate?: NativeDate;
    actualDurationMinutes?: number;
    assignedTechnicianId?: Types.ObjectId;
    assignedTechnicianName?: string;
    supervisingEngineerId?: Types.ObjectId;
    followUpDate?: NativeDate;
    followUpDescription?: string;
    signatures?: {
        technicianId: Types.ObjectId;
        technicianName: string;
        signedAt: NativeDate;
        signatureData?: string;
    };
    approvals?: {
        version: number;
        approvedBy: Types.ObjectId;
        approvedAt: NativeDate;
        comments?: string;
    };
} & import("mongoose").DefaultTimestampProps, {}, {
    timestamps: true;
    collection: string;
}> & {
    status: MaintenanceStatus;
    documents: Types.ObjectId[];
    metadata: any;
    description: string;
    createdBy: Types.ObjectId;
    scheduledDate: NativeDate;
    recommendations: string[];
    priority: MaintenancePriority;
    title: string;
    totalCost: number;
    maintenanceCode: string;
    maintenanceType: MaintenanceType;
    estimatedDurationMinutes: number;
    checklist: Types.DocumentArray<{
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }> & {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }>;
    partsUsed: Types.DocumentArray<{
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }> & {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }>;
    labor: Types.DocumentArray<{
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }, Types.Subdocument<import("bson").ObjectId, any, {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }> & {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }>;
    costBreakdown: {
        partsCost: number;
        laborCost: number;
        externalServiceCost: number;
        otherCost: number;
    };
    followUpRequired: boolean;
    photos: string[];
    venueId?: Types.ObjectId;
    calibrationProfileId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    cameraId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    sensorId?: Types.ObjectId;
    findings?: string;
    updatedBy?: Types.ObjectId;
    actualStartDate?: NativeDate;
    actualEndDate?: NativeDate;
    actualDurationMinutes?: number;
    assignedTechnicianId?: Types.ObjectId;
    assignedTechnicianName?: string;
    supervisingEngineerId?: Types.ObjectId;
    followUpDate?: NativeDate;
    followUpDescription?: string;
    signatures?: {
        technicianId: Types.ObjectId;
        technicianName: string;
        signedAt: NativeDate;
        signatureData?: string;
    };
    approvals?: {
        version: number;
        approvedBy: Types.ObjectId;
        approvedAt: NativeDate;
        comments?: string;
    };
} & import("mongoose").DefaultTimestampProps & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    collection: string;
}, {
    status: MaintenanceStatus;
    documents: Types.ObjectId[];
    metadata: any;
    description: string;
    createdBy: Types.ObjectId;
    scheduledDate: NativeDate;
    recommendations: string[];
    priority: MaintenancePriority;
    title: string;
    totalCost: number;
    maintenanceCode: string;
    maintenanceType: MaintenanceType;
    estimatedDurationMinutes: number;
    checklist: Types.DocumentArray<{
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }> & {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }>;
    partsUsed: Types.DocumentArray<{
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }> & {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }>;
    labor: Types.DocumentArray<{
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }, Types.Subdocument<import("bson").ObjectId, any, {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }> & {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }>;
    costBreakdown: {
        partsCost: number;
        laborCost: number;
        externalServiceCost: number;
        otherCost: number;
    };
    followUpRequired: boolean;
    photos: string[];
    venueId?: Types.ObjectId;
    calibrationProfileId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    cameraId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    sensorId?: Types.ObjectId;
    findings?: string;
    updatedBy?: Types.ObjectId;
    actualStartDate?: NativeDate;
    actualEndDate?: NativeDate;
    actualDurationMinutes?: number;
    assignedTechnicianId?: Types.ObjectId;
    assignedTechnicianName?: string;
    supervisingEngineerId?: Types.ObjectId;
    followUpDate?: NativeDate;
    followUpDescription?: string;
    signatures?: {
        technicianId: Types.ObjectId;
        technicianName: string;
        signedAt: NativeDate;
        signatureData?: string;
    };
    approvals?: {
        version: number;
        approvedBy: Types.ObjectId;
        approvedAt: NativeDate;
        comments?: string;
    };
} & import("mongoose").DefaultTimestampProps, Document<unknown, {}, import("mongoose").FlatRecord<{
    status: MaintenanceStatus;
    documents: Types.ObjectId[];
    metadata: any;
    description: string;
    createdBy: Types.ObjectId;
    scheduledDate: NativeDate;
    recommendations: string[];
    priority: MaintenancePriority;
    title: string;
    totalCost: number;
    maintenanceCode: string;
    maintenanceType: MaintenanceType;
    estimatedDurationMinutes: number;
    checklist: Types.DocumentArray<{
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }> & {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }>;
    partsUsed: Types.DocumentArray<{
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }> & {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }>;
    labor: Types.DocumentArray<{
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }, Types.Subdocument<import("bson").ObjectId, any, {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }> & {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }>;
    costBreakdown: {
        partsCost: number;
        laborCost: number;
        externalServiceCost: number;
        otherCost: number;
    };
    followUpRequired: boolean;
    photos: string[];
    venueId?: Types.ObjectId;
    calibrationProfileId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    cameraId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    sensorId?: Types.ObjectId;
    findings?: string;
    updatedBy?: Types.ObjectId;
    actualStartDate?: NativeDate;
    actualEndDate?: NativeDate;
    actualDurationMinutes?: number;
    assignedTechnicianId?: Types.ObjectId;
    assignedTechnicianName?: string;
    supervisingEngineerId?: Types.ObjectId;
    followUpDate?: NativeDate;
    followUpDescription?: string;
    signatures?: {
        technicianId: Types.ObjectId;
        technicianName: string;
        signedAt: NativeDate;
        signatureData?: string;
    };
    approvals?: {
        version: number;
        approvedBy: Types.ObjectId;
        approvedAt: NativeDate;
        comments?: string;
    };
} & import("mongoose").DefaultTimestampProps>, {}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    timestamps: true;
    collection: string;
}>> & import("mongoose").FlatRecord<{
    status: MaintenanceStatus;
    documents: Types.ObjectId[];
    metadata: any;
    description: string;
    createdBy: Types.ObjectId;
    scheduledDate: NativeDate;
    recommendations: string[];
    priority: MaintenancePriority;
    title: string;
    totalCost: number;
    maintenanceCode: string;
    maintenanceType: MaintenanceType;
    estimatedDurationMinutes: number;
    checklist: Types.DocumentArray<{
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }> & {
        status: "completed" | "failed" | "pending" | "skipped";
        description: string;
        evidence: Types.DocumentArray<{
            type?: string;
            url?: string;
        }, Types.Subdocument<import("bson").ObjectId, any, {
            type?: string;
            url?: string;
        }> & {
            type?: string;
            url?: string;
        }>;
        itemId: string;
        isRequired: boolean;
        notes?: string;
        completedAt?: NativeDate;
        completedBy?: Types.ObjectId;
    }>;
    partsUsed: Types.DocumentArray<{
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }, Types.Subdocument<import("bson").ObjectId, any, {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }> & {
        name: string;
        partId: string;
        partNumber: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        notes?: string;
        warrantyExpiry?: NativeDate;
        supplier?: string;
    }>;
    labor: Types.DocumentArray<{
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }, Types.Subdocument<import("bson").ObjectId, any, {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }> & {
        role: string;
        totalCost: number;
        technicianId: Types.ObjectId;
        technicianName: string;
        hoursWorked: number;
        hourlyRate: number;
        tasksPerformed: string[];
    }>;
    costBreakdown: {
        partsCost: number;
        laborCost: number;
        externalServiceCost: number;
        otherCost: number;
    };
    followUpRequired: boolean;
    photos: string[];
    venueId?: Types.ObjectId;
    calibrationProfileId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    cameraId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    sensorId?: Types.ObjectId;
    findings?: string;
    updatedBy?: Types.ObjectId;
    actualStartDate?: NativeDate;
    actualEndDate?: NativeDate;
    actualDurationMinutes?: number;
    assignedTechnicianId?: Types.ObjectId;
    assignedTechnicianName?: string;
    supervisingEngineerId?: Types.ObjectId;
    followUpDate?: NativeDate;
    followUpDescription?: string;
    signatures?: {
        technicianId: Types.ObjectId;
        technicianName: string;
        signedAt: NativeDate;
        signatureData?: string;
    };
    approvals?: {
        version: number;
        approvedBy: Types.ObjectId;
        approvedAt: NativeDate;
        comments?: string;
    };
} & import("mongoose").DefaultTimestampProps> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=maintenance.schema.d.ts.map