/// <reference path="../../../_references.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');

class ParameterProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Parameter');
    }

    getArgs(parameter: IParameterNode): Array<any> {
        if (!utils.isObject(parameter)) {
            return [];
        }

        return [
            (parameter.method ? parameter.method.id_ : null),
            parameter.name_,
            parameter.type,
            (parameter.methodtype ? parameter.methodtype.id_ : null),
            (parameter.classtype ? parameter.classtype.id_ : null),
            (parameter.interfacetype ? parameter.interfacetype.id_ : null),
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
 