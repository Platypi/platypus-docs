/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../db.d.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');
import model = require('../models/parameter.model');

class ParameterProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Parameter');
    }

    getArgs(parameter: model.IParameter): Array<any> {
        if (!utils.isObject(parameter)) {
            return [];
        }

        return [
            parameter.methodid,
            parameter.name,
            parameter.type,
            parameter.methodtypeid,
            parameter.classtypeid,
            parameter.interfacetypeid,
            parameter.description,
            parameter.defaultvalue,
            parameter.optional,
            parameter.porder
        ];
    }

    read(id: number) {
        return super.read(id).then((sets: db.docs.api.rowsets.IGetParameterRowSets) => {
            var p = sets[0][0];
            return p;
        });
    }
}

export = ParameterProcedures;
 