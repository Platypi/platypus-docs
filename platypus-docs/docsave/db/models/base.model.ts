import errorModel = require('./error.model');
import utils = require('../../../utils/utils');
import PromiseStatic = require('es6-promise');

export interface IBaseModel {
    id?: number;
}

var ValidationError = errorModel.ValidationError;

export class BaseModel<T> {
    Promise = PromiseStatic.Promise;

    validate(obj: T, options?: any): Thenable<errorModel.IValidationErrors> {

        // Check if object is invalid
        if (this.isValidObject(obj) !== undefined) {
            return this.Promise.reject([this.isValidObject(obj)]);
        }

        return this.Promise.resolve<errorModel.IValidationErrors>(this.validateProperties(obj, options)).then((errors) => {
            errors = this.filterValidations(errors);

            if (utils.isArray(errors) && errors.length > 0) {
                throw errors;
            }

            return errors;
        });
    }

    validateProperties(obj: T, options?: any): any {
        return [];
    }

    filterValidations(validations: errorModel.IValidationErrors) {
        var i: number = 0,
            validation: any,
            errors: errorModel.IValidationErrors = [];

        // If individual validation contains an error, store it to be returned later
        for (i = 0; i < validations.length; i++) {
            validation = validations[i];
            if (validation !== undefined) {
                errors.push(validation);
            }
        }

        return errors;
    }

    // Item must be a valid object
    isValidObject(obj: T): errorModel.IValidationError {
        if (!utils.isObject(obj)) {
            return new ValidationError('Invalid object');
        }
    }

    isString(value: string, property?: string, displayProperty?: string): errorModel.IValidationError {
        if (!utils.isString(value) || value.length <= 0) {
            return new ValidationError(displayProperty + ' can not be blank', property);
        }
    }

    isNumber(value: number, property?: string, displayProperty?: string): errorModel.IValidationError {
        if (!utils.isNumber(value)) {
            return new ValidationError(displayProperty + ' can not be blank', property);
        }
    }
}
