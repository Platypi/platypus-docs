/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../db.d.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');
import model = require('../models/method.model');

class MethodProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Method');
    }

    getArgs(method: model.IMethod) {
        if (!utils.isObject(method)) {
            return [];
        }

        return [
            method.namespaceid,
            method.classid,
            method.interfaceid,
            method.name,
            method.description,
            method.example,
            method.exampleurl,
            method.remarks,
            method.visibility,
            method.static,
            method.returntype,
            method.returntypedesc,
            method.returntypemethodid,
            method.returntypeinterfaceid,
            method.returntypeclassid,
            method.returntypenamespaceid,
            method.overrides,
            method.optional
        ];
    }

    read(id: number) {
        return super.read(id).then((sets: db.docs.api.rowsets.IGetMethodRowSets) => {
            var method = sets[0],
                parent = sets[1][0],
                parameters = sets[2],
                typeparameters = sets[3],
                m = method.pop();

            m.parent = parent;
            m.parameters = parameters;
            m.typeparameters = typeparameters;
            return m;
        });
    }
}

export = MethodProcedures;
 