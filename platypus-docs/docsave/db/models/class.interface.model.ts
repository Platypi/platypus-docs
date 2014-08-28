/// <reference path="../../../typings/tsd.d.ts" />

import errorModel = require('./error.model');
import baseDoc = require('./api.model');

export class ClassInterfaceModel extends baseDoc.ApiModel<IClassInterface> {

    /**
     * Validates a Class Interface
     */

}

export interface IClassInterface extends baseDoc.IApiModel {
    classid?: number;
    interfaceid?: number;
}
