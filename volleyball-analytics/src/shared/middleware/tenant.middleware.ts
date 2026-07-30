import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../shared/logger';

const logger = createLogger('TenantIsolationMiddleware');

export interface TenantRequest extends Request {
  tenantId?: string;
}

export function tenantIsolationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = (req as any).user;
  
  if (!user || !user.organizationId) {
    logger.warn('Tenant context missing', {
      correlationId: (req as any).correlationId,
      path: req.path,
    });
    res.status(403).json({
      success: false,
      message: 'Tenant context required',
      errors: [{ code: 'MISSING_TENANT_CONTEXT', message: 'Organization context is required' }],
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  (req as any).tenantId = user.organizationId;
  
  logger.debug('Tenant context resolved', {
    correlationId: (req as any).correlationId,
    tenantId: user.organizationId,
  .organizationId,
    userId: user.userId,
  });
  
  next();
}

export function validateTenantAccess(entityTenantId: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user || !user.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Tenant context required',
        errors: [{ code: 'MISSING_TENANT_CONTEXT', message: 'Organization context is required' }],
        timestamp: new Date().toISOString(),
      });
    }
    
    if (user.organizationId !== entityTenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - cross-tenant access denied',
        errors: [{ code: 'TENANT_ISOLATION_VIOLATION', message: 'Cross-tenant access is prohibited' }],
        timestamp: new Date().toISOString(),
      });
    }
    
    next();
  };
}

export function extractTenantIdFromRequest(req: Request): string | null {
  const user = (req as any).user;
  return user?.organizationId || null;
}