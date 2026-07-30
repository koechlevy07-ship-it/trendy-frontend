import { Request, Response, NextFunction } from 'express';
import { VenueRepository } from '../modules/court-venue/repositories/venue.repository';
import { CourtRepository } from '../modules/court-venue/repositories/court.repository';
import { VenueStatus } from '../modules/court-venue/schemas/venue.schema';
import { CourtStatus } from '../modules/court-venue/schemas/court.schema';

export function createVenueScopeMiddleware(venueRepository: VenueRepository) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const venueId = req.params.venueId || req.body.venueId;
    
    if (!venueId) {
      return next();
    }
    
    try {
      const venue = await venueRepository.findById(venueId);
      
      if (!venue) {
        return res.status(404).json({
          success: false,
          message: 'Venue not found',
          errors: [{ code: 'VENUE_NOT_FOUND', message: 'Venue not found' }],
          timestamp: new Date().toISOString(),
        });
      }
      
      const user = (req as any).user;
      
      if (user.organizationId !== venue.organizationId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - venue belongs to different organization',
          errors: [{ code: 'TENANT_ISOLATION_VIOLATION', message: 'Cross-tenant venue access denied' }],
          timestamp: new Date().toISOString(),
        });
      }
      
      if (venue.status === VenueStatus.ARCHIVED) {
        return res.status(403).json({
          success: false,
          message: 'Venue is archived',
          errors: [{ code: 'VENUE_ARCHIVED', message: 'Cannot operate on archived venue' }],
          timestamp: new Date().toISOString(),
        });
      }
      
      if (venue.status === VenueStatus.SUSPENDED) {
        return res.status(403).json({
          success: false,
          message: 'Venue is suspended',
          errors: [{ code: 'VENUE_SUSPENDED', message: 'Venue is currently suspended' }],
          timestamp: new Date().toISOString(),
        });
      }
      
      (req as any).venue = venue;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Venue scope validation failed',
        errors: [{ code: 'VENUE_SCOPE_ERROR', message: 'Failed to validate venue scope' }],
        timestamp: new Date().toISOString(),
      });
    }
  };
}

export function createCourtScopeMiddleware(courtRepository: CourtRepository) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const courtId = req.params.courtId || req.body.courtId;
    
    if (!courtId) {
      return next();
    }
    
    try {
      const court = await courtRepository.findById(courtId);
      
      if (!court) {
        return res.status(404).json({
          success: false,
          message: 'Court not found',
          errors: [{ code: 'COURT_NOT_FOUND', message: 'Court not found' }],
          timestamp: new Date().toISOString(),
        });
      }
      
      const user = (req as any).user;
      
      if (court.venueId.toString() !== (req as any).venue?._id?.toString()) {
        const venueRepository = require('../modules/court-venue/repositories/venue.repository');
        const venue = await new (require('../modules/court-venue/repositories/venue.repository').VenueRepository)().findById(court.venueId.toString());
        
        if (venue && user.organizationId !== venue.organizationId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied - court belongs to different organization',
            errors: [{ code: 'TENANT_ISOLATION_VIOLATION', message: 'Cross-tenant court access denied' }],
            timestamp: new Date().toISOString(),
          });
        }
      }
      
      if (court.status === CourtStatus.ARCHIVED) {
        return res.status(403).json({
          success: false,
          message: 'Court is archived',
          errors: [{ code: 'COURT_ARCHIVED', message: 'Cannot operate on archived court' }],
          timestamp: new Date().toISOString(),
        });
      }
      
      if (court.status === CourtStatus.SUSPENDED) {
        return res.status(403).json({
          success: false,
          message: 'Court is suspended',
          errors: [{ code: 'COURT_SUSPENDED', message: 'Court is currently suspended' }],
          timestamp: new Date().toISOString(),
        });
      }
      
      if (court.maintenanceStatus && court.maintenanceStatus.isUnderMaintenance) {
        return res.status(403).json({
          success: false,
          message: 'Court is under maintenance',
          errors: [{ code: 'COURT_UNDER_MAINTENANCE', message: 'Court is currently under maintenance' }],
          timestamp: new Date().toISOString(),
        });
      }
      
      (req as any).court = court;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Court scope validation failed',
        errors: [{ code: 'COURT_SCOPE_ERROR', message: 'Failed to validate court scope' }],
        timestamp: new Date().toISOString(),
      });
    }
  };
}