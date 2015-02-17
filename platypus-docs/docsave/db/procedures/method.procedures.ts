/// <reference path="../../../_references.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');

class MethodProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Method');
    }

    getArgs(method: IMethodNode) {
        if (!utils.isObject(method)) {
            return [];
        }

        var parent = method.parent_,
            namespaceid: number = null,
            classid: number = null,
            interfaceid: number = null;

        switch (parent.kind) {
            case 'namespace':
                namespaceid = parent.id_;
                break;
            case 'class':
                classid = parent.id_;
                break;
            case 'interface':
                interfaceid = parent.id_;
                break;
        }


        var argsRtn = [
            namespaceid,
            classid,
            interfaceid,
            method.name_,
            method.description_,
            method.example,
            method.exampleurl,
            method.remarks,
            method.visibility,
            false, // method.static,
            null, // method.returntype,
            method.returntypedesc,
            (method.returntypemethod ? method.returntypemethod.id_ : null),
            (method.returntypeinterface ? method.returntypeinterface.id_ : null),
            (method.returntypeclass ? method.returntypeclass.id_ : null),
            (method.returntypenamespace ? method.returntypenamespace.id_ : null),
            method.overrides,
            method.optional,
            false,
            method.version
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
 