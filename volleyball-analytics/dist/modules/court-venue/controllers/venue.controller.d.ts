import { VenueService } from '../services/venue.service';
import { CreateVenueDto, UpdateVenueDto, ActivateVenueDto, SuspendVenueDto, VenueSearchDto } from '../dtos/venue.dto';
export declare class VenueController {
    private readonly venueService;
    constructor(venueService: VenueService);
    createVenue(createVenueDto: CreateVenueDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").IVenue>>;
    getVenues(searchDto: VenueSearchDto): Promise<import("@shared/api-response").PaginatedResponse<unknown>>;
    getVenueById(id: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").IVenue>>;
    getVenueByCode(venueCode: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").IVenue>>;
    updateVenue(id: string, updateVenueDto: UpdateVenueDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").IVenue>>;
    activateVenue(id: string, activateDto: ActivateVenueDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").IVenue>>;
    suspendVenue(id: string, suspendDto: SuspendVenueDto): Promise<import("@shared/api-response").ApiResponse<import("../schemas").IVenue>>;
    archiveVenue(id: string): Promise<import("@shared/api-response").ApiResponse<any>>;
    restoreVenue(id: string): Promise<import("@shared/api-response").ApiResponse<import("../schemas").IVenue>>;
    getVenuesByOrganization(organizationId: string, page?: number, limit?: number): Promise<import("@shared/api-response").PaginatedResponse<unknown>>;
    getVenueStats(organizationId: string): Promise<import("@shared/api-response").ApiResponse<any>>;
}
//# sourceMappingURL=venue.controller.d.ts.map