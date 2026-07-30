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
export declare class Validator<T> {
    private rules;
    addRule(rule: ValidationRule<T>): this;
    required<F extends keyof T>(field: F, message?: string): this;
    string<F extends keyof T>(field: F, message?: string): this;
    number<F extends keyof T>(field: F, message?: string): this;
    boolean<F extends keyof T>(field: F, message?: string): this;
    enum<F extends keyof T, E extends string>(field: F, allowedValues: E[], message?: string): this;
    minLength<F extends keyof T>(field: F, min: number, message?: string): this;
    maxLength<F extends keyof T>(field: F, max: number, message?: string): this;
    min<F extends keyof T>(field: F, min: number, message?: string): this;
    max<F extends keyof T>(field: F, max: number, message?: string): this;
    email<F extends keyof T>(field: F, message?: string): this;
    objectId<F extends keyof T>(field: F, message?: string): this;
    coordinate<F extends keyof T>(field: F, message?: string): this;
    date<F extends keyof T>(field: F, message?: string): this;
    custom<F extends keyof T>(field: F, validator: (value: unknown, object: T) => ValidationResult, message?: string): this;
    validate(object: T): ValidationError[];
    validateOrThrow(object: T): void;
}
export declare class ValidationException extends Error {
    readonly errors: ValidationError[];
    constructor(errors: ValidationError[]);
}
export declare function createValidator<T>(): Validator<T>;
//# sourceMappingURL=validator.d.ts.map