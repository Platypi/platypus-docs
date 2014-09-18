/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../db.d.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');
import DocNodeTypes = require('../../../docnodes');

class ParameterProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Parameter');
    }

    getArgs(parameter: DocNodeTypes.IParameterNode): Array<any> {
        if (!utils.isObject(parameter)) {
            return [];
        }

        return [
            (parameter.method ? parameter.method.id : null),
            parameter.name_,
            parameter.type,
            (parameter.methodtype ? parameter.methodtype.id : null),
            (parameter.classtype ? parameter.classtype.id : null),
            (parameter.interfacetype ? parameter.interfacetype.id : null),
            parameter.description_,
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
 