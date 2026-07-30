/**
 * Permissions Decorator - Chapter 11 Part 4
 * 
 * Decorator for declaring required permissions on route handlers.
 * Used by AuthorizationMiddleware to enforce RBAC.
 */

import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'required_permissions';

/**
 * Decorator to specify required permissions for an endpoint
 * 
 * @param permissions - Array of permission strings required
 * @returns Method decorator
 * 
 * @example
 * @Permissions('organization:create', 'organization:update')
 * @Post()
 * async create(@Body() dto: CreateOrganizationDTO) { ... }
 */
export const Permissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to specify a single required permission
 * @param permission - Single permission string
 */
export const Permission = (permission: string) => 
  SetMetadata(PERMISSIONS_KEY, [permission]);