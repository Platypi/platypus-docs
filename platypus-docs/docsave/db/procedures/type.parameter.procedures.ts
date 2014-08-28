/// <reference path="../../../typings/tsd.d.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');
import model = require('../models/type.parameter.model');

class TypeParameterProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('TypeParameter');
    }

    getArgs(parameter: model.ITypeParameter): Array<any> {
        if (!utils.isObject(parameter)) {
            return [];
        }

        return [
            parameter.interfaceid,
            parameter.classid,
            parameter.methodid,
            parameter.classtypeid,
            parameter.interfacetypeid,
            parameter.name,
            parameter.description,
            parameter.porder
        ];
    }
}

export = TypeParameterProcedures;
 