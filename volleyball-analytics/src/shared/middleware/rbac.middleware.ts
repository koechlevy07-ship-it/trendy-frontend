import { Request, Response, NextFunction } from 'express';
import { hasAnyPermission, UserContext, Permission } from '../rbac';
import { createLogger } from '../shared/logger';

const logger = createLogger('RBACMiddleware');

export interface AuthorizedRequest extends Request {
  user: any;
}

export function requirePermission(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user) {
      logger.warn('Authorization attempted without authenticated user', {
        correlationId: (req as any).correlationId,
        path: req.path,
      });
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: [{ code: 'NOT_AUTHENTICATED', message: 'User not authenticated' }],
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    if (!hasAnyPermission(user, requiredPermissions)) {
      logger.warn('Authorization failed - insufficient permissions', {
        correlationId: (req as any).correlationId,
        userId: user.userId,
        requiredPermissions,
        userPermissions: user.permissions,
      });
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        errors: [{
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Required permissions: ${requiredPermissions.join(', ')}`,
        }],
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    logger.debug('Authorization granted', {
      correlationId: (req as any).correlationId,
      userId: user.userId,
      permissions: requiredPermissions,
    });
    
    next();
  };
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: [{ code: 'NOT_AUTHENTICATED', message: 'User not authenticated' }],
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    const userRoles = user.roles || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      logger.warn('Role-based authorization failed', {
        correlationId: (req as any).correlationId,
        userId: user.userId,
        userRoles,
        requiredRoles: allowedRoles,
      });
      res.status(403).json({
        success: false,
        message: 'Insufficient role',
        errors: [{
          code: 'INSUFFICIENT_ROLE',
          message: `Required roles: ${allowedRoles.join(', ')}`,
        }],
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    next();
  };
}

export function requireOrganizationAccess() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user || !user.organizationId) {
      logger.warn('Organization context missing', {
        correlationId: (req as any).correlationId,
        userId: user?.userId,
      });
      res.status(403).json({
        success: false,
        message: 'Organization context required',
        errors: [{ code: 'MISSING_ORG_CONTEXT', message: 'User must belong to an organization' }],
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    next();
  };
}