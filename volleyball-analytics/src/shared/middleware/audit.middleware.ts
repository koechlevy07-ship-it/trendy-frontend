import { Request, Response, NextFunction } from 'express';
import { createDomainEvent, eventPublisher } from '../shared/domain-events';

export interface AuditContext {
  userId: string;
  userRole: string;
  organizationId: string;
  venueId?: string;
  courtId?: string;
  cameraId?: string;
  equipmentId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  result: 'success' | 'failure' | 'partial';
  remarks?: string;
}

export function createAuditMiddleware() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json;
    
    res.json = function(body: any): Response {
      const auditContext: AuditContext = {
        userId: (req as any).user?.userId || 'anonymous',
        userRole: (req as any).user?.role || 'anonymous',
        organizationId: (req as any).user?.organizationId || 'unknown',
        venueId: (req as any).venue?._id?.toString(),
        courtId: (req as any).court?._id?.toString(),
        cameraId: (req as any).camera?._id?.toString(),
        equipmentId: (req as any).equipment?._id?.toString(),
        action: getActionFromMethod(req.method, req.path),
        entityType: getEntityTypeFromPath(req.path),
        entityId: getEntityIdFromRequest(req),
        oldValues: (req as any).oldValues,
        newValues: body?.data || body,
        result: res.statusCode < 400 ? 'success' : 'failure',
        remarks: (req as any).auditRemarks,
      };
      
      const auditEvent = createDomainEvent(
        `Audit.${auditContext.action}`,
        auditContext.entityId,
        auditContext.entityType,
        auditContext,
        {
          correlationId: (req as any).correlationId,
          userId: auditContext.userId,
          organizationId: auditContext.organizationId,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }
      );
      
      eventPublisher.publish(auditEvent).catch(console.error);
      
      return originalJson.call(this, body);
    };
    
    next();
  };
}

export function createManualAuditMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    (req as any).recordAudit = (context: Partial<{
      action: string;
      entityType: string;
      entityId: string;
      oldValues: Record<string, any>;
      newValues: Record<string, any>;
      result: 'success' | 'failure' | 'partial';
      remarks?: string;
    }>) => {
      (req as any).auditContext = {
        ...(req as any).auditContext,
        ...context,
      };
    };
    
    next();
  };
}

function getActionFromMethod(method: string, path: string): string {
  const methodMap: Record<string, string> = {
    POST: 'Created',
    GET: 'Viewed',
    PUT: 'Updated',
    PATCH: 'Updated',
    DELETE: 'Deleted',
  };
  
  const entity = getEntityTypeFromPath(path);
  const action = methodMap[method] || 'Modified';
  
  return `${action} ${entity}`;
}

function getEntityTypeFromPath(path: string): string {
  if (path.includes('/venues')) return 'Venue';
  if (path.includes('/courts')) return 'Court';
  if (path.includes('/cameras')) return 'Camera';
  if (path.includes('/calibrations')) return 'Calibration';
  if (path.includes('/facilities')) return 'Facility';
  if (path.includes('/equipment')) return 'Equipment';
  if (path.includes('/sensors')) return 'Sensor';
  if (path.includes('/maintenance')) return 'MaintenanceRecord';
  if (path.includes('/documents')) return 'Document';
  if (path.includes('/coverage-zones')) return 'CoverageZone';
  if (path.includes('/calibrations')) return 'CalibrationProfile';
  return 'Resource';
}

function getEntityIdFromPath(req: Request): string {
  return req.params.id || req.params.venueId || req.params.courtId || 
         req.params.cameraId || req.params.facilityId || req.params.equipmentId ||
         req.params.sensorId || req.params.calibrationId || req.params.documentId ||
         req.params.maintenanceId || req.params.coverageZoneId || req.params.calibrationId ||
         req.body.id || req.body.venueId || req.body.courtId || '';
}

export function createAuditContext(req: Request, context: Partial<{
  action: string;
  entityType: string;
  entityId: string;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  result: 'success' | 'failure' | 'partial';
  remarks?: string;
}>): void {
  (req as any).auditContext = {
    ...(req as any).auditContext,
    ...context,
  };
}