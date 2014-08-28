/// <reference path="../../../typings/tsd.d.ts" />

import errorModel = require('./error.model');
import baseDoc = require('./api.model');

export class TypeParameterModel extends baseDoc.ApiModel<ITypeParameter> {

    /**
     * Validates a Parameter
     */

    validateProperties(parameter: ITypeParameter): errorModel.IValidationErrors {
        var validations = [
            this.validateName(parameter.name),
            this.validateDescription(parameter.description),
            this.validateParentId(parameter)
        ];
        return super.filterValidations(validations);
    }

    // Individual Validations

    validateName(name: string): errorModel.IValidationError {
        return this.isString(name);
    }

    validateDescription(description: string): errorModel.IValidationError {
        return this.isString(description);
    }

    validateParentId(p: ITypeParameter): errorModel.IValidationError {
        var n = this.isNumber,
            t: number = 0;

        if (!n(p.classtypeid, 'classtypeid')) {
            t = p.classtypeid;
        } else if (!n(p.methodtypeid, 'methodtypeid')) {
            t = p.methodtypeid;
        }
        return n(t);
    }
}

export interface ITypeParameter extends baseDoc.IApiModel {
    id?: number;
    interfaceid?: number;
    classid?: number;
    methodid?: number;
    name?: string;
    methodtypeid?: number;
    classtypeid?: number;
    interfacetypeid?: number;
    description?: string;
    porder?: string;
}
 