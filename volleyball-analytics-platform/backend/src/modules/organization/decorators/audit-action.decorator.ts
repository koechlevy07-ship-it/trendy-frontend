/**
 * Audit Action Decorator - Chapter 11 Part 4
 * 
 * Decorator for declaring audit action names on route handlers.
 * Used by AuditLoggingInterceptor to determine the audit action name.
 */

import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit_action';

/**
 * Decorator to specify the audit action name for an endpoint
 * 
 * @param action - The audit action name
 * @returns Method decorator
 * 
 * @example
 * @AuditAction('organization_registered')
 * @Post()
 * async create(@Body() dto: CreateOrganizationDTO) { ... }
 */
export const AuditAction = (action: string) => 
  SetMetadata(AUDIT_ACTION_KEY, action);