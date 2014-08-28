export interface IValidationError {
    message: string;
    property: string;
}

export interface IValidationErrors extends Array<IValidationError> { }

export class ValidationError implements IValidationError {
    constructor(public message: string, public property?: string) { }
}
 