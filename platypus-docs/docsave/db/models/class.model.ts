/// <reference path="../../../typings/tsd.d.ts" />

import errorModel = require('./error.model');
import baseDoc = require('./api.model');

export class ClassModel extends baseDoc.ApiModel<IClass> {

    /**
     * Validates a Class
     */

    validateProperties(classDoc: IClass): errorModel.IValidationErrors {
        var validations = [
            this.validateName(classDoc.name),
            this.validateDescription(classDoc.description),
            this.validateNamespaceId(classDoc.namespaceid)
        ];
        return super.filterValidations(validations);
    }

    // Individual Validations

    validateName(name: string): errorModel.IValidationError {
        return this.isString(name, 'name', 'Name');
    }

    validateDescription(description: string): errorModel.IValidationError {
        return this.isString(description, 'description', 'Description');
    }

    validateNamespaceId(namespaceId: number): errorModel.IValidationError {
        return this.isNumber(namespaceId, 'namespaceid', 'Namespace ID');
    }
}

export interface IClass extends baseDoc.IApiModel {
    id?: number;
    parentid?: number;
    namespaceid?: number;
    name?: string;
    description?: string;
    example?: string;
    exampleurl?: string;
    remarks?: string;
    exported?: boolean;
    static?: boolean;
    registeredtype?: string;
    registeredname?: string;
}
 