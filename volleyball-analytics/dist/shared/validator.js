"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = exports.Validator = void 0;
exports.createValidator = createValidator;
class Validator {
    constructor() {
        this.rules = [];
    }
    addRule(rule) {
        this.rules.push(rule);
        return this;
    }
    required(field, message) {
        return this.addRule({ field, validate: (value) => ({ valid: value !== undefined && value !== null && value !== '', message: message || `${String(field)} is required`, code: 'REQUIRED' }) });
    }
    string(field, message) {
        return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || typeof value === 'string', message: message || `${String(field)} must be a string`, code: 'INVALID_TYPE' }) });
    }
    number(field, message) {
        return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || typeof value === 'number', message: message || `${String(field)} must be a number`, code: 'INVALID_TYPE' }) });
    }
    boolean(field, message) {
        return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || typeof value === 'boolean', message: message || `${String(field)} must be a boolean`, code: 'INVALID_TYPE' }) });
    }
    enum(field, allowedValues, message) {
        return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || allowedValues.includes(value), message: message || `${String(field)} must be one of: ${allowedValues.join(', ')}`, code: 'INVALID_ENUM' }) });
    }
    minLength(field, min, message) {
        return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || (typeof value === 'string' && value.length >= min), message: message || `${String(field)} must be at least ${min} characters`, code: 'MIN_LENGTH' }) });
    }
    maxLength(field, max, message) {
        return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || (typeof value === 'string' && value.length <= max), message: message || `${String(field)} must be at most ${max} characters`, code: 'MAX_LENGTH' }) });
    }
    min(field, min, message) {
        return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || (typeof value === 'number' && value >= min), message: message || `${String(field)} must be at least ${min}`, code: 'MIN_VALUE' }) });
    }
    max(field, max, message) {
        return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || (typeof value === 'number' && value <= max), message: message || `${String(field)} must be at most ${max}`, code: 'MAX_VALUE' }) });
    }
    email(field, message) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || emailRegex.test(value), message: message || `${String(field)} must be a valid email`, code: 'INVALID_EMAIL' }) });
    }
    objectId(field, message) {
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || objectIdRegex.test(value), message: message || `${String(field)} must be a valid ObjectId`, code: 'INVALID_OBJECT_ID' }) });
    }
    coordinate(field, message) {
        return this.addRule({
            field,
            validate: (value, object) => {
                const lat = object.latitude;
                const lng = object.longitude;
                const isLat = String(field) === 'latitude';
                const val = isLat ? lat : lng;
                return { valid: val === undefined || val === null || (typeof val === 'number' && val >= (isLat ? -90 : -180) && val <= (isLat ? 90 : 180)), message: message || `${String(field)} must be a valid coordinate`, code: 'INVALID_COORDINATE' };
            }
        });
    }
    date(field, message) {
        return this.addRule({ field, validate: (value) => ({ valid: value === undefined || value === null || (value instanceof Date && !isNaN(value.getTime())) || (typeof value === 'string' && !isNaN(Date.parse(value))), message: message || `${String(field)} must be a valid date`, code: 'INVALID_DATE' }) });
    }
    custom(field, validator, message) {
        return this.addRule({ field, validate: (value, object) => { const result = validator(value, object); return { ...result, message: result.message || message || `Validation failed for ${String(field)}` }; } });
    }
    validate(object) {
        const errors = [];
        for (const rule of this.rules) {
            const value = object[rule.field];
            const result = rule.validate(value, object);
            if (!result.valid) {
                errors.push({ field: String(rule.field), message: result.message || `Validation failed for ${String(rule.field)}`, code: result.code || 'VALIDATION_ERROR', value });
            }
        }
        return errors;
    }
    validateOrThrow(object) {
        const errors = this.validate(object);
        if (errors.length > 0)
            throw new ValidationException(errors);
    }
}
exports.Validator = Validator;
class ValidationException extends Error {
    constructor(errors) { super('Validation failed'); this.name = 'ValidationException'; this.errors = errors; }
}
exports.ValidationException = ValidationException;
function createValidator() { return new Validator(); }
//# sourceMappingURL=validator.js.map