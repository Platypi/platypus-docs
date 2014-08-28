/// <reference path="../../../typings/tsd.d.ts" />

import errorModel = require('./error.model');
import baseDoc = require('./api.model');

export class NamespaceModel extends baseDoc.ApiModel<INamespace> {

    /**
     * Validates a Namespace
     */

    validateProperties(namespace: INamespace): errorModel.IValidationErrors {
        var validations = [
            this.validateName(namespace.name),
            this.validateDescription(namespace.description)
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
}

export interface INamespace extends baseDoc.IApiModel {
    id?: number;
    parentid?: number;
    name?: string;
    description?: string;
}
 