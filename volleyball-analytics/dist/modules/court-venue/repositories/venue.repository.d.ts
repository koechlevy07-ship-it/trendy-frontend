import { Model, Types } from 'mongoose';
import { MongoRepository } from './base.repository';
import { IVenue, IVenueContact, VenueStatus } from '../schemas/venue.schema';
export declare class VenueRepository extends MongoRepository<IVenue> {
    constructor(model: Model<IVenue>);
    findByVenueCode(venueCode: string): Promise<IVenue | null>;
    findByOrganization(organizationId: string, pagination?: {
        page: number;
        limit: number;
    }): Promise<IVenue[]>;
    findByOrganizationAndName(organizationId: string, venueName: string): Promise<IVenue | null>;
    findActiveByOrganization(organizationId: string): Promise<IVenue[]>;
    findByStatus(status: VenueStatus, pagination?: {
        page: number;
        limit: number;
    }): Promise<IVenue[]>;
    findNearby(longitude: number, latitude: number, maxDistanceKm?: number, pagination?: {
        page: number;
        limit: number;
    }): Promise<IVenue[]>;
    findRequiringCertification(): Promise<IVenue[]>;
    activateVenue(id: string, activatedBy: Types.ObjectId): Promise<IVenue | null>;
    suspendVenue(id: string, suspendedBy: Types.ObjectId, reason: string): Promise<IVenue | null>;
    archiveVenue(id: string, archivedBy: Types.ObjectId): Promise<IVenue | null>;
    restoreVenue(id: string): Promise<IVenue | null>;
    addContact(id: string, contact: IVenueContact): Promise<IVenue | null>;
    removeContact(id: string, contactIndex: number): Promise<IVenue | null>;
    updateContact(id: string, contactIndex: number, contact: Partial<IVenueContact>): Promise<IVenue | null>;
    setPrimaryContact(id: string, contactIndex: number): Promise<IVenue | null>;
    getVenueStats(organizationId: string): Promise<any>;
}
//# sourceMappingURL=venue.repository.d.ts.map