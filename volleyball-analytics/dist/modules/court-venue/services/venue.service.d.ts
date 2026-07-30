import { Model } from 'mongoose';
import { IVenue } from '../schemas/venue.schema';
import { CreateVenueDto, UpdateVenueDto, ActivateVenueDto, SuspendVenueDto, VenueSearchDto } from '../dtos/venue.dto';
import { VenueRepository } from '../repositories/venue.repository';
import { BusinessValidator } from '../validators/business.validator';
export declare class VenueService {
    private readonly venueModel;
    private readonly venueRepository;
    private readonly businessValidator;
    constructor(venueModel: Model<IVenue>, venueRepository: VenueRepository, businessValidator: BusinessValidator);
    createVenue(createVenueDto: CreateVenueDto, userId: string): Promise<IVenue>;
    getVenues(searchDto: VenueSearchDto): Promise<any>;
    getVenueById(id: string): Promise<IVenue>;
    getVenueByCode(venueCode: string): Promise<IVenue>;
    updateVenue(id: string, updateVenueDto: UpdateVenueDto, userId: string): Promise<IVenue>;
    activateVenue(id: string, activateDto: ActivateVenueDto): Promise<IVenue>;
    suspendVenue(id: string, suspendDto: SuspendVenueDto): Promise<IVenue>;
    archiveVenue(id: string, userId: string): Promise<IVenue>;
    restoreVenue(id: string, userId: string): Promise<IVenue>;
    deleteVenue(id: string): Promise<void>;
    getVenuesByOrganization(organizationId: string, page?: number, limit?: number): Promise<any>;
    getVenueStats(organizationId: string): Promise<any>;
    private publishEvent;
}
//# sourceMappingURL=venue.service.d.ts.map