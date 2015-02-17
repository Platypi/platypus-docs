/// <reference path="../../../_references.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');

class InterfaceProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Interface');
    }

    getArgs(i: IInterfaceNode) {
        if (!utils.isObject(i)) {
            return [];
        }

        return [
            (i.parent_ ? i.parent_.id_ : null),
            i.name_,
            i.description_,
            i.remarks,
            i.exported,
            i.registeredtype,
            i.registeredname,
            false,
            i.version
        ];
    }

    read(id: number, overloads?: boolean) {
        return super.read(id, !overloads).then((sets: db.docs.api.rowsets.IGetInterfaceRowSets) => {
            var interface = sets[0],
                inherits = sets[1],
                namespace = sets[2][0],
                methods = sets[3],
                properties = sets[4],
                typeparameters = sets[5],
                i = interface.pop();

            i.inherits = inherits;
            i.namespace = namespace;
            i.methods = methods;
            i.properties = properties;
            i.typeparameters = typeparameters;
            return i;
        });
    }
}

export = InterfaceProcedures;
 