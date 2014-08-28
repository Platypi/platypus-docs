/// <reference path="../../../typings/tsd.d.ts" />

import errorModel = require('./error.model');
import baseDoc = require('./api.model');

export class PropertyModel extends baseDoc.ApiModel<IProperty> {

    /**
     * Validates a Property
     */

    validateProperties(propertyDoc: IProperty): errorModel.IValidationErrors {
        var validations = [
            this.validateName(propertyDoc.name),
            this.validateDescription(propertyDoc.description),
            this.validateParentId(propertyDoc)
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

    validateParentId(p: IProperty): errorModel.IValidationError {
        var n = this.isNumber,
            t: number = 0;

        if (!n(p.classtypeid, 'classtypeid')) {
            t = p.classtypeid;
        } else if (!n(p.interfacetypeid, 'interfacetypeid')) {
            t = p.interfacetypeid;
        }
        return n(t);
    }
}

export interface IProperty extends baseDoc.IApiModel {
    id?: number;
    name?: string;
    type?: string;
    classtypeid?: number;
    interfacetypeid?: number;
    description?: string;
    remarks?: string;
    visibility?: string;
    static?: boolean;
    readonly?: boolean;
    returntypedesc?: string;
    namespaceid?: number;
    classid?: number;
    interfaceid?: number;
    methodtypeid?: number;
    overrides?: boolean;
    optional?: boolean;
}
 