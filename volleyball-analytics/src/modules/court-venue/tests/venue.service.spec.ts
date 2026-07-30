import { Test, TestingModule } from '@nestjs/testing';
import { VenueService } from '../services/venue.service';
import { VenueRepository } from '../repositories/venue.repository';
import { BusinessValidator } from '../validators/business.validator';
import { CreateVenueDto } from '../dtos/venue.dto';

const mockVenueRepository = {
  findByVenueCode: jest.fn(),
  findByOrganizationAndName: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  activateVenue: jest.fn(),
  suspendVenue: jest.fn(),
  archiveVenue: jest.fn(),
  getVenueStats: jest.fn(),
};

const mockBusinessValidator = {
  validateVenueUniqueness: jest.fn(),
  validateVenueEligibility: jest.fn(),
};

describe('VenueService', () => {
  let service: VenueService;
  let venueRepository: VenueRepository;
  let businessValidator: BusinessValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VenueService,
        { provide: VenueRepository, useValue: mockVenueRepository },
        { provide: BusinessValidator, useValue: mockBusinessValidator },
      ],
    }).compile();

    service = module.get<VenueService>(VenueService);
    venueRepository = module.get<VenueRepository>(VenueRepository);
    businessValidator = module.get<BusinessValidator>(BusinessValidator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVenue', () => {
    const createVenueDto: CreateVenueDto = {
      venueName: 'Test Venue',
      venueCode: 'TV001',
      organizationId: 'org123',
      venueType: 'indoor',
      address: {
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        country: 'USA',
        postalCode: '12345',
        formattedAddress: '123 Main St, Test City, TS 12345, USA',
      },
      latitude: 40.7128,
      longitude: -74.0060,
      capacity: 1000,
      contacts: [],
      operatingHours: [],
      certificationRequired: false,
      timezone: 'UTC',
      createdBy: 'user123',
    };

    const mockCreatedVenue = {
      _id: 'venue123',
      ...createVenueDto,
      organizationId: { toString: () => 'org123' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a venue successfully', async () => {
      mockBusinessValidator.validateVenueUniqueness.mockResolvedValue({
        valid: true,
        errors: [],
      });
      mockVenueRepository.create.mockResolvedValue(mockCreatedVenue);

      const result = await service.createVenue(createVenueDto, 'user123');

      expect(result).toEqual(mockCreatedVenue);
      expect(mockBusinessValidator.validateVenueUniqueness).toHaveBeenCalledWith(
        'TV001',
        'org123',
        'Test Venue'
      );
      expect(mockVenueRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when venue code already exists', async () => {
      mockBusinessValidator.validateVenueUniqueness.mockResolvedValue({
        valid: false,
        errors: [{ field: 'venueCode', message: 'Venue code already exists', code: 'DUPLICATE_VENUE_CODE' }],
      });

      await expect(service.createVenue(createVenueDto, 'user123'))
        .rejects.toThrow('Venue code already exists');
    });

    it('should throw ConflictException when venue name already exists in organization', async () => {
      mockBusinessValidator.validateVenueUniqueness.mockResolvedValue({
        valid: false,
        errors: [{ field: 'venueName', message: 'Venue name already exists in organization', code: 'DUPLICATE_VENUE_NAME' }],
      });

      await expect(service.createVenue(createVenueDto, 'user123'))
        .rejects.toThrow('Venue name already exists in organization');
    });
  });

  describe('activateVenue', () => {
    it('should activate venue successfully', async () => {
      const mockVenue = { _id: 'venue123', status: 'active' };
      mockVenueRepository.findById.mockResolvedValue({ _id: 'venue123', status: 'draft', certificationRequired: false });
      mockVenueRepository.activateVenue.mockResolvedValue(mockVenue);

      const result = await service.activateVenue('venue123', { activatedBy: 'user123' });

      expect(result).toEqual(mockVenue);
      expect(mockVenueRepository.activateVenue).toHaveBeenCalledWith('venue123', 'user123');
    });

    it('should throw BadRequestException when venue is already active', async () => {
      mockVenueRepository.findById.mockResolvedValue({ _id: 'venue123', status: 'active' });

      await expect(service.activateVenue('venue123', { activatedBy: 'user123' }))
        .rejects.toThrow('Venue is already active');
    });

    it('should throw BadRequestException when certification is required but missing', async () => {
      mockVenueRepository.findById.mockResolvedValue({ 
        _id: 'venue123', 
        status: 'draft', 
        certificationRequired: true 
      });

      await expect(service.activateVenue('venue123', { activatedBy: 'user123' }))
        .rejects.toThrow('Venue requires valid certification before activation');
    });
  });
});