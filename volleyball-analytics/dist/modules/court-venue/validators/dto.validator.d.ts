import { Validator } from '../../shared/validator';
export declare class DTOValidatorFactory {
    private validators;
    constructor();
    private initializeValidators;
    getValidator(key: string): Validator<any> | undefined;
    validate(key: string, data: any): {
        valid: boolean;
        errors: any[];
    };
}
//# sourceMappingURL=dto.validator.d.ts.map