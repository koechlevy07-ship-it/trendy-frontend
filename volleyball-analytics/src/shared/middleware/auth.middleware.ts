import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/jwt.utils';
import { UserContext, Role, Permission } from '../rbac';
import { createLogger } from '../shared/logger';

const logger = createLogger('AuthMiddleware');

export interface AuthenticatedRequest extends Request {
  user?: UserContext;
}

export interface JWTPayload {
  sub: string;
  email: string;
  roles: Role[];
  organizationId?: string;
  permissions?: Permission[];
  exp: number;
  iat: number;
}

export function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid Authorization header', {
      correlationId: (req as any).correlationId,
      path: req.path,
    });
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      errors: [{ code: 'MISSING_AUTH', message: 'Bearer token required' }],
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = verifyToken(token) as JWTPayload;
    
    if (!payload || payload.exp * 1000 < Date.now()) {
      logger.warn('Token expired or invalid', {
        correlationId: (req as any).correlationId,
      });
      res.status(401).json({
        success: false,
        message: 'Token expired',
        errors: [{ code: 'TOKEN_EXPIRED', message: 'Please re-authenticate' }],
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    const userContext: UserContext = {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      organizationId: payload.organizationId,
      permissions: payload.permissions,
    };
    
    (req as any).user = userContext;
    
    logger.debug('User authenticated', {
      correlationId: (req as any).correlationId,
      userId: payload.sub,
      roles: payload.roles,
    });
    
    next();
  } catch (error) {
    logger.error('Token verification failed', {
      correlationId: (req as any).correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      errors: [{ code: 'INVALID_TOKEN', message: 'Token verification failed' }],
      timestamp: new Date().toISOString(),
    });
  }
}

export function optionalAuthenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }
  
  authenticationMiddleware(req, res, next);
}