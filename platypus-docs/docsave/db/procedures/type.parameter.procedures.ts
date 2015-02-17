/// <reference path="../../../_references.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');

class TypeParameterProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('TypeParameter');
    }

    getArgs(parameter: ITypeParameterNode): Array<any> {
        if (!utils.isObject(parameter)) {
            return [];
        }

        return [
            (parameter.interface ? parameter.interface.id_ : null),
            (parameter.class ? parameter.class.id_ : null),
            (parameter.method ? parameter.method.id_ : null),
            (parameter.classtype ? parameter.classtype.id_ : null),
            (parameter.interfacetype ? parameter.interfacetype.id_ : null),
            parameter.name_,
            parameter.description_,
            parameter.porder
        ];
    }
}

export = TypeParameterProcedures;
 