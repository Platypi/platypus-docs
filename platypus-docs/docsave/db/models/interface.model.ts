/// <reference path="../../../typings/tsd.d.ts" />

import errorModel = require('./error.model');
import baseDoc = require('./api.model');

export class InterfaceModel extends baseDoc.ApiModel<IInterface> {

    /**
     * Validates a Interface
     */

    validateProperties(interfaceDoc: IInterface): errorModel.IValidationErrors {
        var validations = [
            this.validateName(interfaceDoc.name),
            this.validateDescription(interfaceDoc.description),
            this.validateNamespaceId(interfaceDoc.namespaceid)
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

    validateNamespaceId(namespaceId: number): errorModel.IValidationError {
        return this.isNumber(namespaceId, 'namespaceid');
    }
}

export interface IInterface extends baseDoc.IApiModel {
    id?: number;
    namespaceid?: number;
    name?: string;
    description?: string;
    remarks?: string;
    exported?: boolean;
    registeredtype?: string;
    registeredname?: string;
}
 