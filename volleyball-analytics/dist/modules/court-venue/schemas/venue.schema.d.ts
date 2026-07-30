import { Types, HydratedDocument } from 'mongoose';
export declare enum VenueType {
    INDOOR = "indoor",
    OUTDOOR = "outdoor",
    BEACH = "beach",
    MIXED = "mixed",
    MOBILE = "mobile"
}
export declare enum VenueStatus {
    DRAFT = "draft",
    REGISTERED = "registered",
    ACTIVE = "active",
    SUSPENDED = "suspended",
    UNDER_MAINTENANCE = "under_maintenance",
    ARCHIVED = "archived",
    DECOMMISSIONED = "decommissioned"
}
export interface IVenueContact {
    name: string;
    role: string;
    email: string;
    phone: string;
    isPrimary: boolean;
}
export interface IVenueOperatingHours {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}
export interface IVenueAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}
export interface IVenue {
    venueName: string;
    venueCode: string;
    organizationId: Types.ObjectId;
    venueType: VenueType;
    status: VenueStatus;
    address: IVenueAddress;
    latitude: number;
    longitude: number;
    capacity: number;
    operatingHours: IVenueOperatingHours[];
    contacts: IVenueContact[];
    certificationRequired: boolean;
    certifications: Types.ObjectId[];
    mediaAssets: {
        images: string[];
        videos: string[];
        documents: string[];
    };
    documents: Types.ObjectId[];
    metadata: Record<string, unknown>;
    suspendedAt?: Date;
    suspendedBy?: Types.ObjectId;
    suspendedReason?: string;
    activatedAt?: Date;
    activatedBy?: Types.ObjectId;
    archivedAt?: Date;
    archivedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export type VenueDocument = HydratedDocument<IVenue>;
export declare const Venue: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<IVenue, {}, {}, {}, import("mongoose").Document<unknown, {}, IVenue, {}, {}> & IVenue & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=venue.schema.d.ts.map