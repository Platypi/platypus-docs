/// <reference path="../../../typings/tsd.d.ts" />

import errorModel = require('./error.model');
import baseDoc = require('./api.model');

export class MethodModel extends baseDoc.ApiModel<IMethod> {

    /**
     * Validates a Method
     */

    validateProperties(methodDoc: IMethod): errorModel.IValidationErrors {
        var validations = [
            this.validateName(methodDoc.name),
            this.validateDescription(methodDoc.description),
            this.validateParentId(methodDoc)
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

    validateParentId(m: IMethod): errorModel.IValidationError {
        var n = this.isNumber,
            t: number = 0;

        if (!n(m.returntypemethodid, 'returntypemethodid')) {
            t = m.returntypemethodid;
        } else if (!n(m.returntypeinterfaceid, 'returntypeinterfaceid')) {
            t = m.returntypeinterfaceid;
        } else if (!n(m.returntypeclassid, 'returntypeclassid')) {
            t = m.returntypeclassid;
        } else if (!n(m.returntypenamespaceid, 'returntypenamespaceid')) {
            t = m.returntypenamespaceid;
        }
        return n(t);
    }
}

export interface IMethod extends baseDoc.IApiModel {
    id?: number;
    name?: string;
    description?: string;
    example?: string;
    exampleurl?: string;
    remarks?: string;
    visibility?: string;
    static?: boolean;
    returntype?: string;
    returntypedesc?: string;
    returntypemethodid?: number;
    returntypeinterfaceid?: number;
    returntypeclassid: number;
    returntypenamespaceid?: number;
    namespaceid?: number;
    interfaceid?: number;
    classid?: number;
    overrides?: boolean;
    optional?: boolean;
}
 