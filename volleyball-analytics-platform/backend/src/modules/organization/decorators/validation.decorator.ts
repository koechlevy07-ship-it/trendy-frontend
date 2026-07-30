/**
 * Validation Decorator - Chapter 11 Part 4
 * 
 * Decorator for declaring DTO validation on route handlers.
 * Used by ValidationMiddleware to validate incoming requests.
 */

import { SetMetadata } from '@nestjs/common';

export const VALIDATION_DTO_KEY = 'validation_dto';

/**
 * Decorator to specify the validation DTO class for a route
 * 
 * @param dtoClass - The DTO class to validate against
 * @returns Method decorator
 * 
 * @example
 * @ValidateDto(CreateOrganizationDTO)
 * @Post()
 * async create(@Body() dto: CreateOrganizationDTO) { ... }
 */
export const ValidateDto = (dtoClass: any) => 
  SetMetadata(VALIDATION_DTO_KEY, dtoClass);