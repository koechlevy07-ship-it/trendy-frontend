import { Injectable, NestMiddleware, Logger, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Reflector } from '@nestjs/core';
import { VALIDATION_DTO_KEY } from '../decorators/validation.decorator';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ValidationMiddleware.name);

  constructor(private readonly reflector: Reflector) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const dtoClass = this.reflector.get(
      VALIDATION_DTO_KEY,
      req.route?.stack[req.route?.stack.length - 1]?.handle,
    );

    if (!dtoClass) {
      return next();
    }

    // Transform and validate body
    const dtoInstance = plainToClass(dtoClass, req.body);
    validate(dtoInstance, { whitelist: true, forbidNonWhitelisted: true })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const formattedErrors = this.formatValidationErrors(errors);
          
          this.logger.warn('Validation failed', {
            correlationId: (req as any).correlationId,
            path: req.path,
            errors: formattedErrors,
          });

          throw new BadRequestException({
            message: 'Validation failed',
            errors: formattedErrors,
          });
        }

        // Replace body with validated/transformed instance
        req.body = dtoInstance;
        next();
      })
      .catch(err => {
        if (err instanceof BadRequestException) {
          throw err;
        }
        this.logger.error('Validation error', err.stack);
        throw new BadRequestException('Validation processing failed');
      });
  }

  private formatValidationErrors(errors: ValidationError[]): any[] {
    return errors.map(error => ({
      property: error.property,
      constraints: error.constraints,
      children: error.children?.length ? this.formatValidationErrors(error.children) : undefined,
    }));
  }
}