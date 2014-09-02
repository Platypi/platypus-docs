/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../db.d.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');
import model = require('../models/method.model');
import DocNodeTypes = require('../../../docnodes');

class MethodProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Method');
    }

    getArgs(method: DocNodeTypes.IMethodNode) {
        if (!utils.isObject(method)) {
            return [];
        }

        var parent = method.parent,
            namespaceid: number = null,
            classid: number = null,
            interfaceid: number = null;

        switch (parent.kind) {
            case 'namespace':
                namespaceid = parent.id;
                break;
            case 'class':
                classid = parent.id;
                break;
            case 'interface':
                interfaceid = parent.id;
                break;
        }

        //console.log('erroneous method name: ' + method.name_);

        var argsRtn = [
            namespaceid,
            classid,
            interfaceid,
            method.name_,
            method.description,
            method.example,
            method.exampleurl,
            method.remarks,
            method.visibility,
            false, //method.static,
            null, //method.returntype,
            method.returntypedesc,
            (method.returntypemethod ? method.returntypemethod.id : null),
            (method.returntypeinterface ? method.returntypeinterface.id : null),
            (method.returnttypeclass ? method.returnttypeclass.id : null),
            (method.returntypenamespace ? method.returntypenamespace.id : null),
            method.overrides,
            method.optional,
            false,
            '0.1'
        ];

        return argsRtn;
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
 