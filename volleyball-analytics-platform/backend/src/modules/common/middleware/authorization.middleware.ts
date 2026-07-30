import { Injectable, NestMiddleware, Logger, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionService } from '../services/permission.service';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthorizationMiddleware.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Skip if no permissions required (public endpoint)
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      req.route?.stack[req.route?.stack.length - 1]?.handle,
    ) || [];

    if (requiredPermissions.length === 0) {
      return next();
    }

    // Get user context from request (set by AuthMiddleware)
    const user = (req as any).user;
    if (!user) {
      throw new ForbiddenException('User context not found');
    }

    // Validate permissions
    const hasPermission = await this.permissionService.hasPermissions(
      user,
      requiredPermissions,
    );

    if (!hasPermission) {
      this.logger.warn(`Access denied: User ${user.id} lacks required permissions`, {
        correlationId: (req as any).correlationId,
        userId: user.id,
        requiredPermissions,
        userPermissions: user.permissions,
        path: req.path,
      });
      
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`
      );
    }

    this.logger.debug(`Authorization successful`, {
      correlationId: (req as any).correlationId,
      userId: user.id,
      permissions: requiredPermissions,
      path: req.path,
    });

    next();
  }
}