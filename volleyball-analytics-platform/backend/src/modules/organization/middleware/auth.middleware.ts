/**
 * Authentication Middleware - Chapter 11 Part 4
 * 
 * Integrates with centralized Authentication Module.
 * Validates JWT tokens, extracts user context, and attaches to request.
 * Does NOT implement standalone authentication.
 */

import { Injectable, NestMiddleware, Logger, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../shared/interfaces/user.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Skip authentication for health endpoints
    if (this.isPublicEndpoint(req.path)) {
      return next();
    }

    try {
      const token = this.extractToken(req);
      
      if (!token) {
        throw new UnauthorizedException('Authentication token is required');
      }

      // Verify and decode JWT token
      const payload = await this.verifyToken(token);
      
      // Validate token hasn't been revoked (integrate with auth module)
      await this.validateTokenStatus(payload);
      
      // Attach user context to request
      (req as any).user = this.mapPayloadToUser(payload);
      (req as any).token = token;
      
      this.logger.debug(`User authenticated: ${payload.sub}`, { 
        correlationId: (req as any).correlationId,
        userId: payload.sub,
        tenantId: payload.tenantId
      });

      next();
    } catch (error) {
      this.logger.warn(`Authentication failed: ${error.message}`, {
        correlationId: (req as any).correlationId,
        path: req.path,
        ip: req.ip
      });
      
      // Return standardized error response
      return this.handleAuthError(res, error);
    }
  }

  private isPublicEndpoint(path: string): boolean {
    const publicPaths = [
      '/health',
      '/health/live',
      '/health/ready',
      '/api/v1/organizations/public',
      '/api/v1/teams/public'
    ];
    
    return publicPaths.some(p => path.startsWith(p));
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  private async verifyToken(token: string): Promise<any> {
    const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
    
    try {
      return await this.jwtService.verifyAsync(token, { secret });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async validateTokenStatus(payload: any): Promise<void> {
    // TODO: Integrate with centralized auth module to check token revocation
    // This would call the auth module's token validation service
    
    // Check token expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('Token has expired');
    }
  }

  private mapPayloadToUser(payload: any): User {
    return {
      id: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      organizationId: payload.organizationId,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }

  private handleAuthError(res: Response, error: Error): void {
    const statusCode = error instanceof UnauthorizedException ? 401 : 500;
    const errorCode = error instanceof UnauthorizedException ? 'UNAUTHORIZED' : 'AUTH_ERROR';
    
    res.status(statusCode).json({
      success: false,
      statusCode,
      error: {
        code: errorCode,
        message: error.message,
        details: [],
        correlationId: (res as any).correlationId || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
  }
}