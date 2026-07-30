export interface ValidationRule<T> {
  field: keyof T;
  validate: (value: unknown, object: T) => ValidationResult;
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export class Validator<T> {
  private rules: ValidationRule<T>[] = [];

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  required<F extends keyof T>(field: F, message?: string): this {
    return this.addRule({ field, validate: (value) => ({ valid: value !== undefined && value !== null && value !== '', message: message || `${String(field)} is required`, code: 'REQUIRED' }) });
  }

  string<F extends keyof T>(field: F, message?: string): this {
    return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || typeof value === 'string', message: message || `${String(field)} must be a string`, code: 'INVALID_TYPE' }) });
  }

  number<F extends keyof T>(field: F, message?: string): this {
    return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || typeof value === 'number', message: message || `${String(field)} must be a number`, code: 'INVALID_TYPE' }) });
  }

  boolean<F extends keyof T>(field: F, message?: string): this {
    return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || typeof value === 'boolean', message: message || `${String(field)} must be a boolean`, code: 'INVALID_TYPE' }) });
  }

  enum<F extends keyof T, E extends string>(field: F, allowedValues: E[], message?: string): this {
    return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || allowedValues.includes(value as E), message: message || `${String(field)} must be one of: ${allowedValues.join(', ')}`, code: 'INVALID_ENUM' }) });
  }

  minLength<F extends keyof T>(field: F, min: number, message?: string): this {
    return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || (typeof value === 'string' && value.length >= min), message: message || `${String(field)} must be at least ${min} characters`, code: 'MIN_LENGTH' }) });
  }

  maxLength<F extends keyof T>(field: F, max: number, message?: string): this {
    return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || (typeof value === 'string' && value.length <= max), message: message || `${String(field)} must be at most ${max} characters`, code: 'MAX_LENGTH' }) });
  }

  min<F extends keyof T>(field: F, min: number, message?: string): this {
    return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || (typeof value === 'number' && value >= min), message: message || `${String(field)} must be at least ${min}`, code: 'MIN_VALUE' }) });
  }

  max<F extends keyof T>(field: F, max: number, message?: string): this {
    return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || (typeof value === 'number' && value <= max), message: message || `${String(field)} must be at most ${max}`, code: 'MAX_VALUE' }) });
  }

  email<F extends keyof T>(field: F, message?: string): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || emailRegex.test(value as string), message: message || `${String(field)} must be a valid email`, code: 'INVALID_EMAIL' }) });
  }

  objectId<F extends keyof T>(field: F, message?: string): this {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || objectIdRegex.test(value as string), message: message || `${String(field)} must be a valid ObjectId`, code: 'INVALID_OBJECT_ID' }) });
  }

  coordinate<F extends keyof T>(field: F, message?: string): this {
    return this.addRule({
      field,
      validate: (value, object) => {
        const lat = (object as Record<string, unknown>).latitude as number;
        const lng = (object as Record<string, unknown>).longitude as number;
        const isLat = String(field) === 'latitude';
        const val = isLat ? lat : lng;
        return { valid: val === undefined || val === null || (typeof val === 'number' && val >= (isLat ? -90 : -180) && val <= (isLat ? 90 : 180)), message: message || `${String(field)} must be a valid coordinate`, code: 'INVALID_COORDINATE' };
      }
    });
  }

  date<F extends keyof T>(field: F, message?: string): this {
    return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || (value instanceof Date && !isNaN(value.getTime())) || (typeof value === 'string' && !isNaN(Date.parse(value))), message: message || `${String(field)} must be a valid date`, code: 'INVALID_DATE' }) });
  }

  custom<F extends keyof T>(field: F, validator: (value: unknown, object: T) => ValidationResult, message?: string): this {
    return this.addRule({ field, validate: (value, object) => { const result = validator(value, object); return { ...result, message: result.message || message || `Validation failed for ${String(field)}` }; } });
  }

  validate(object: T): ValidationError[] {
    const errors: ValidationError[] = [];
    for (const rule of this.rules) {
      const value = object[rule.field];
      const result = rule.validate(value, object);
      if (!result.valid) {
        errors.push({ field: String(rule.field), message: result.message || `Validation failed for ${String(rule.field)}`, code: result.code || 'VALIDATION_ERROR', value });
      }
    }
    return errors;
  }

  validateOrThrow(object: T): void {
    const errors = this.validate(object);
    if (errors.length > 0) throw new ValidationException(errors);
  }
}

export class ValidationException extends Error {
  public readonly errors: ValidationError[];
  constructor(errors: ValidationError[]) { super('Validation failed'); this.name = 'ValidationException'; this.errors = errors; }
}

export function createValidator<T>(): Validator<T> { return new Validator<T>(); }