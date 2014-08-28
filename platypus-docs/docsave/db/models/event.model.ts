/// <reference path="../../../typings/tsd.d.ts" />

import errorModel = require('./error.model');
import baseDoc = require('./api.model');

export class EventModel extends baseDoc.ApiModel<IEvent> {

    /**
     * Validates a Event
     */

    validateProperties(event: IEvent): errorModel.IValidationErrors {
        var validations = [
            this.validateName(event.name),
            this.validateDescription(event.description),
            this.validateClassId(event.classid)
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

    validateClassId(classId: number): errorModel.IValidationError {
        return this.isNumber(classId, 'classid');
    }
}

export interface IEvent extends baseDoc.IApiModel {
    id?: number;
    classid?: number;
    name?: string;
    description?: string;
    remarks?: string;
    example?: string;
    exampleurl?: string;
}
 