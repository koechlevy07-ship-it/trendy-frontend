import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../shared/logger';

const logger = createLogger('AuditMiddleware');

export interface AuditRecord {
  auditId: string;
  tenantId: string;
  organizationId: string;
  venueId?: string;
  courtId?: string;
  cameraId?: string;
  equipmentId?: string;
  userId: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  device?: string;
  browser?: string;
  operatingSystem?: string;
  correlationId: string;
  result: 'success' | 'failure';
  remarks?: string;
}

export interface AuditedRequest extends Request {
  auditContext?: {
    entityType: string;
    entityId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    action: string;
    entityId?: string;
  };
}

export function auditMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalSend = res.send;
  
  res.send = function (body: string): Response {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      const reqAny = req as any;
      const user = reqAny.user;
      
      if (reqAny.auditContext && user) {
        const auditRecord = createAuditRecord(req, res, {
          entityType: reqAny.auditContext.entityType,
          entityId: reqAny.auditContext.entityId,
          oldValues: reqAny.auditContext.oldValues,
          newValues: reqAny.auditContext.newValues,
          action: reqAny.auditContext.action,
        });
        
        logger.info('Audit record created', auditRecord);
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
}

export function createAuditRecord(
  req: Request,
  res: Response,
  context: {
    entityType: string;
    entityId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    action: string;
  }
): AuditRecord {
  const reqAny = req as any;
  const user = reqAny.user;
  
  return {
    auditId: uuidv4(),
    tenantId: user?.organizationId || 'unknown',
    organizationId: user?.organizationId || 'unknown',
    venueId: reqAny.auditContext?.venueId,
    courtId: reqAny.auditContext?.courtId,
    cameraId: reqAny.auditContext?.cameraId,
    equipmentId: reqAny.auditContext?.equipmentId,
    userId: user?.userId || 'system',
    userRole: user?.roles?.join(',') || 'system',
    action: context.action,
    entityType: context.entityType,
    entityId: context.entityId,
    oldValues: context.oldValues,
    newValues: context.newValues,
    timestamp: new Date(),
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    device: req.get('user-agent'),
    browser: req.get('sec-ch-ua') || req.get('user-agent'),
    operatingSystem: req.get('sec-ch-ua-platform') || 'unknown',
    correlationId: reqAny.correlationId,
    result: res.statusCode < 400 ? 'success' : 'failure',
    remarks: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : undefined,
  };
}

export function setAuditContext(
  req: Request,
  context: {
    entityType: string;
    entityId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    action: string;
    venueId?: string;
    courtId?: string;
    cameraId?: string;
    equipmentId?: string;
  }
): void {
  (req as any).auditContext = context;
}

export function getAuditMiddleware() {
  return auditMiddleware;
}

export const createAuditMiddleware = () => auditMiddleware;